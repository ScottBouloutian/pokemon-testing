import React, { Component } from 'react';
import { chain, map, assign } from 'lodash';
import { tween } from 'shifty';
import Promise from 'bluebird';
import './App.css';
import Pokedex from './Pokedex';
import pokeball from './images/pokeball.svg';
import statAssets from './statAssets';

class App extends Component {
    constructor() {
        super();
        this.state = {
            appLoading: true,
            sprite: null,
            stats: [],
            error: null,
            pokemonName: '',
            pokemonLoading: false,
        };
        this.pokedex = new Pokedex();
        this.statsElement = null;
    }

    componentWillMount() {
        this.pokedex.initialize()
        .then(() => this.getRandomPokemon())
        .then(() => {
            this.setState({ appLoading: false });
        })
        .catch(error => this.setState({ error }));
    }

    getRandomPokemon() {
        this.setState({ pokemonLoading: true });
        return this.pokedex.randomPokemon()
        .then((pokemon) => {
            const sprite = pokemon.sprites.front_default;
            const stats = chain(pokemon.stats)
            .map(({ stat, base_stat }) => ({
                name: stat.name,
                value: base_stat,
                width: 0,
            }))
            .reverse()
            .value();
            this.setState({
                sprite,
                stats,
                pokemonName: pokemon.name,
                pokemonLoading: false,
            });
            return this.animateStatBars(stats);
        })
        .catch(error =>
            this.setState({
                error,
                pokemonLoading: false,
            }),
        );
    }

    animateStatBars(stats) {
        return Promise.map(stats, stat => (
            tween({
                from: { width: 0 },
                to: { width: stat.value },
                duration: 500,
                easing: 'easeTo',
                step: ({ width }) => {
                    assign(stat, { width });
                    this.setState({ stats });
                },
            })
        ));
    }

    render() {
        const { appLoading, sprite, stats, pokemonName, pokemonLoading } = this.state;

        // Stats section of the application
        const statsInfo = map(stats, ({ name, width }) => {
            const { icon, color } = statAssets[name];
            const statStyle = {
                backgroundColor: color,
                width: `${width * 2}px`,
            };
            return (
              <div className="stat" key={name}>
                <img alt={name} className="stat-icon" src={icon} />
                <div className="stat-bar" style={statStyle} />
              </div>
            );
        });

        // Title section of the application
        const titleSection = pokemonLoading ? (
          <img alt="loading" src="images/pikachu.gif" />
        ) : (
          <h1>{pokemonName}</h1>
        );

        // Loading section of the application
        const loadingSection = (
          <div className="loading">
            <img alt="loading" src="images/loading.gif" />
          </div>
        );

        // Main section of the application
        const mainSection = (
          <div className="container">
            <div className="title-section">
              {titleSection}
            </div>
            <div className="info">
              <div className="pokemon-section">
                { sprite ? <img alt={pokemonName} src={sprite} /> : null }
              </div>
              <div className="stats-info" ref={element => (this.statsElement = element)}>
                {statsInfo}
              </div>
            </div>
            <div
              className="pokeball"
              role="button"
              tabIndex={0}
              onClick={() => this.getRandomPokemon()}
            >
              <img alt="pokeball" src={pokeball} />
            </div>
          </div>
        );

        // Framework of the application
        return (
          <div className="app">
            <div className="app-intro">
              {appLoading ? loadingSection : mainSection}
            </div>
          </div>
        );
    }
}

export default App;
