/**
 * Provider interface. Each concrete provider (animepahe, gogoanime, zoro) must implement these methods.
 * No shared parsing logic — each adapter implements independently.
 */
export class AnimeProvider {
  constructor(name) {
    this.name = name;
  }

  async search(query) {
    throw new Error(`${this.name}: search() not implemented`);
  }

  async getAnime(id) {
    throw new Error(`${this.name}: getAnime() not implemented`);
  }

  async getEpisodes(id) {
    throw new Error(`${this.name}: getEpisodes() not implemented`);
  }

  async getStream(episodeId) {
    throw new Error(`${this.name}: getStream() not implemented`);
  }
}
