import { random, reduce } from 'lodash';
import Promise from 'bluebird';

function request(uri, params) {
    const query = reduce(params, (result, value, key) => `${result}${key}=${value}&`, '');
    const querystring = (query === '') ? query : `?${query.slice(0, -1)}`;
    const apiRequest = new Request(`${uri}${querystring}`);
    return fetch(apiRequest).then((response) => {
        const { status } = response;
        if (status === 200) {
            return response.json();
        }
        throw new Error(`error code ${status}`);
    });
}

/**
* @author Scott Bouloutian <ScottBouloutian@gmail.com>
* @class
* @classdesc Library to make requests for Pokemon data
*/
class Pokedex {
    /**
    * Initializes the Pokedex
    * @constructor
    */
    constructor() {
        this.host = 'https://pokeapi.co/api/v2';
        this.pokemonCount = 0;
    }

    /**
    * Initializes the pokedex by making a request to get the number of pokemon available from the
    * api
    * @returns {Promise} A promise that resolves when initialization is complete
    */
    initialize() {
        const params = {
            limit: 0,
            offset: 0,
        };
        return request(`${this.host}/pokemon`, params)
            .then(({ count }) => (this.pokemonCount = count));
    }

    /**
    * Get data for a random pokemon from the api
    * @returns {Promise} A promise that resolves with pokemon data
    */
    randomPokemon() {
        const params = {
            limit: 1,
            offset: random(this.pokemonCount),
        };
        return Promise.resolve()
            .then(() => request(`${this.host}/pokemon`, params))
            .then(({ results }) => request(results[0].url));
    }
}

export default Pokedex;
