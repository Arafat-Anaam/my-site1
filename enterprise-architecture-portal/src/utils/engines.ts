import Fuse from 'fuse.js';
import type { Diagram } from '@types';

export class SearchEngine {
  private fuse: Fuse<Diagram>;

  constructor(diagrams: Diagram[]) {
    this.fuse = new Fuse(diagrams, {
      keys: [
        { name: 'title', weight: 0.8 },
        { name: 'description', weight: 0.6 },
        { name: 'tags', weight: 0.7 },
        { name: 'category', weight: 0.5 },
        { name: 'subcategory', weight: 0.4 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
      useExtendedSearch: true,
    });
  }

  search(query: string): Diagram[] {
    if (!query || query.trim().length === 0) return [];

    const results = this.fuse.search(query);
    return results.map((result) => result.item);
  }

  searchByTag(tag: string): Diagram[] {
    return this.fuse.search(`tags:${tag}`).map((result) => result.item);
  }

  searchByCategory(category: string): Diagram[] {
    return this.fuse.search(`category:${category}`).map((result) => result.item);
  }

  suggestQueries(partial: string, limit: number = 5): string[] {
    const results = this.fuse.search(partial).map((result) => result.item.title);
    return [...new Set(results)].slice(0, limit);
  }

  static createIndex(diagrams: Diagram[]): Fuse<Diagram> {
    return new Fuse(diagrams, {
      keys: ['title', 'description', 'tags', 'category'],
      threshold: 0.3,
    });
  }
}

export class FilterEngine {
  static filterByCategory(
    diagrams: Diagram[],
    category: string
  ): Diagram[] {
    return diagrams.filter((d) => d.category === category);
  }

  static filterByTags(
    diagrams: Diagram[],
    tags: string[],
    matchAll: boolean = false
  ): Diagram[] {
    if (tags.length === 0) return diagrams;

    return diagrams.filter((diagram) => {
      if (matchAll) {
        return tags.every((tag) => diagram.tags.includes(tag));
      }
      return tags.some((tag) => diagram.tags.includes(tag));
    });
  }

  static filterByType(
    diagrams: Diagram[],
    type: string
  ): Diagram[] {
    return diagrams.filter((d) => d.type === type);
  }

  static filterByDifficulty(
    diagrams: Diagram[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Diagram[] {
    return diagrams.filter((d) => d.difficulty === difficulty);
  }

  static filterRecent(
    diagrams: Diagram[],
    days: number = 30
  ): Diagram[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return diagrams.filter(
      (d) => new Date(d.lastUpdated) >= cutoffDate
    );
  }

  static sort(
    diagrams: Diagram[],
    sortBy: 'recent' | 'popular' | 'title' | 'difficulty'
  ): Diagram[] {
    const sorted = [...diagrams];

    switch (sortBy) {
      case 'recent':
        return sorted.sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'difficulty':
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return sorted.sort(
          (a, b) =>
            difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        );
      case 'popular':
      default:
        return sorted;
    }
  }

  static applyMultipleFilters(
    diagrams: Diagram[],
    filters: {
      categories?: string[];
      tags?: string[];
      types?: string[];
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
    }
  ): Diagram[] {
    let result = diagrams;

    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((d) => filters.categories!.includes(d.category));
    }

    if (filters.types && filters.types.length > 0) {
      result = result.filter((d) => filters.types!.includes(d.type));
    }

    if (filters.tags && filters.tags.length > 0) {
      result = this.filterByTags(result, filters.tags);
    }

    if (filters.difficulty) {
      result = this.filterByDifficulty(result, filters.difficulty);
    }

    return result;
  }
}

export class DiagramAnalytics {
  static getStatistics(diagrams: Diagram[]) {
    return {
      totalDiagrams: diagrams.length,
      byCategory: this.countByCategory(diagrams),
      byType: this.countByType(diagrams),
      byDifficulty: this.countByDifficulty(diagrams),
      recentlyUpdated: diagrams
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 5),
      mostCommonTags: this.getMostCommonTags(diagrams),
    };
  }

  private static countByCategory(diagrams: Diagram[]) {
    const counts: Record<string, number> = {};
    diagrams.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }

  private static countByType(diagrams: Diagram[]) {
    const counts: Record<string, number> = {};
    diagrams.forEach((d) => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return counts;
  }

  private static countByDifficulty(diagrams: Diagram[]) {
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };
    diagrams.forEach((d) => {
      counts[d.difficulty]++;
    });
    return counts;
  }

  private static getMostCommonTags(diagrams: Diagram[], limit: number = 10) {
    const tagCounts: Record<string, number> = {};
    diagrams.forEach((d) => {
      d.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  static getRelationshipGraph(diagrams: Diagram[]) {
    const graph: Record<string, string[]> = {};
    diagrams.forEach((d) => {
      graph[d.id] = d.relatedDiagrams;
    });
    return graph;
  }
}

export class ExportEngine {
  static exportAsJSON(diagram: Diagram): string {
    return JSON.stringify(diagram, null, 2);
  }

  static exportAsMarkdown(diagram: Diagram): string {
    return `# ${diagram.title}

## Description
${diagram.description}

## Metadata
- **Category**: ${diagram.category}
- **Type**: ${diagram.type}
- **Difficulty**: ${diagram.difficulty}
- **Tags**: ${diagram.tags.join(', ')}
- **Last Updated**: ${new Date(diagram.lastUpdated).toLocaleDateString()}

## Related Diagrams
${diagram.relatedDiagrams.map((id) => `- ${id}`).join('\n')}

## Content
\`\`\`
${diagram.content}
\`\`\`
`;
  }

  static exportAsHTML(diagram: Diagram): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${diagram.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #1f2937; }
    .metadata { background: #f3f4f6; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${diagram.title}</h1>
    <p>${diagram.description}</p>
    <div class="metadata">
      <p><strong>Category:</strong> ${diagram.category}</p>
      <p><strong>Type:</strong> ${diagram.type}</p>
      <p><strong>Tags:</strong> ${diagram.tags.join(', ')}</p>
    </div>
  </div>
</body>
</html>`;
  }

  static downloadAsJSON(diagram: Diagram): void {
    const json = this.exportAsJSON(diagram);
    this.downloadFile(json, `${diagram.id}.json`, 'application/json');
  }

  static downloadAsMarkdown(diagram: Diagram): void {
    const md = this.exportAsMarkdown(diagram);
    this.downloadFile(md, `${diagram.id}.md`, 'text/markdown');
  }

  static downloadAsHTML(diagram: Diagram): void {
    const html = this.exportAsHTML(diagram);
    this.downloadFile(html, `${diagram.id}.html`, 'text/html');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
