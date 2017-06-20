import Pokedex from './Pokedex';

describe('pokedex', () => {
    let pokedex = null;

    beforeAll(() => {
        global.fetch = jest.fn();
    });

    beforeEach(() => {
        global.fetch.mockReset();
        pokedex = new Pokedex();
    });

    afterEach(() => {
        pokedex = null;
    });

    it('should exist', () => {
        expect(Pokedex).toBeDefined();
    });

    it('should be able to be instantiated', () => {
        expect(pokedex).toBeDefined();
        expect(pokedex.pokemonCount).toBe(0);
        expect(pokedex.host).toBe('https://pokeapi.co/api/v2');
    });

    describe('initializing the pokedex', () => {
        it('should make a request for metadata', () => {
            const result = Promise.resolve({
                status: 200,
                json: () => ({
                    count: 123,
                }),
            });
            global.fetch.mockReturnValue(result);
            return pokedex.initialize().then(() => {
                expect(global.fetch).toHaveBeenCalled();
                const request = global.fetch.mock.calls[0][0];
                expect(request.url).toBe('https://pokeapi.co/api/v2/pokemon?limit=0&offset=0');
            });
        });

        it('should set the number of pokemon', () => {
            const result = Promise.resolve({
                status: 200,
                json: () => ({
                    count: 123,
                }),
            });
            global.fetch.mockReturnValue(result);
            return pokedex.initialize().then(() => {
                expect(pokedex.pokemonCount).toBe(123);
            });
        });

        it('should reject on a failed request', () => {
            const result = Promise.reject(new Error('epic fail'));
            global.fetch.mockReturnValue(result);
            return pokedex.initialize().then(() => {
                throw new Error('should have rejected');
            }).catch(error => (
                expect(error).toEqual(new Error('epic fail'))
            ));
        });

        it('should reject on an unsuccessful status code', () => {
            const result = Promise.resolve({
                status: 500,
            });
            global.fetch.mockReturnValue(result);
            return pokedex.initialize().then(() => {
                throw new Error('should have rejected');
            }).catch(error => (
                expect(error).toEqual(new Error('error code 500'))
            ));
        });
    });

    describe('getting a random pokemon', () => {
        it('should make requests for a random pokemon', () => {
            global.fetch
                .mockImplementationOnce(() => (
                    Promise.resolve({
                        status: 200,
                        json: () => ({
                            results: [
                                {
                                    url: 'pokemon-data-url',
                                },
                            ],
                        }),
                    })
                ))
                .mockImplementationOnce(() => (
                    Promise.resolve({
                        status: 200,
                        json: () => ({
                            data: 'result',
                        }),
                    })
                ));
            pokedex.pokemonCount = 123;
            return pokedex.randomPokemon().then((result) => {
                const calls = global.fetch.mock.calls;
                expect(calls.length).toBe(2);
                expect(calls[0][0].url).toMatch(/https:\/\/pokeapi\.co\/api\/v2\/pokemon\?limit=1&offset=\d/);
                expect(calls[1][0].url).toBe('pokemon-data-url');
                expect(result).toEqual({
                    data: 'result',
                });
            });
        });
    });
});
