import { random, reduce } from 'lodash';
import Promise from 'bluebird';

export default class Pokedex {
  constructor() {
    this.host = 'https://pokeapi.co/api/v2';
    this.pokemonCount = 0;
  }

  initialize() {
    const params = {
      limit: 0,
      offset: 0,
    };
    return this.request(`${this.host}/pokemon`, params).then(({ count }) => {
      this.pokemonCount = count;
    });
  }

  randomPokemon() {
    const params = {
      limit: 1,
      offset: random(this.pokemonCount),
    };
    return Promise.resolve()
      .then(() => this.request(`${this.host}/pokemon`, params))
      .then(({ results }) => {
          return this.request(results[0].url);
      });
  }

  request(uri, params) {
    const query = reduce(params, (result, value, key) => `${result}${key}=${value}&`, '');
    const querystring = (query === '') ? query : `?${query.slice(0, -1)}`;
    const request = new Request(`${uri}${querystring}`);
    return fetch(request).then(response => {
      const { status } = response;
      if (status === 200) {
        return response.json();
      } else {
        throw new Error(`error code ${status}`);
      }
    });
  }
}
