import React, { Component } from 'react';
import { chain, map } from 'lodash';
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
  }

  componentWillMount() {
    this.pokedex.initialize().then(() => {
      this.setState({ appLoading: false });
    }).catch(error => this.setState({ error }));
  }

  pokeballClicked() {
    this.setState({ pokemonLoading: true });
    this.pokedex.randomPokemon()
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
          name: pokemon.name,
          pokemonLoading: false,
        });
        return Promise.map(stats, (stat, index) => (
          tween({
            from: { width: 0 },
            to: { width: stat.value },
            duration: 500,
            easing: 'easeTo',
            step: ({ width }) => {
              stats[index].width = width;
              this.setState({ stats });
            },
          })
        ));
      })
      .catch(error =>
        this.setState({
          error,
          pokemonLoading: false,
        }),
      );
  }

  render() {
    const { appLoading, sprite, stats, pokemonName, pokemonLoading } = this.state;
    const statsInfo = map(stats, ({ name, width }) => {
      const { icon, color } = statAssets[name];
      const statStyle = {
        backgroundColor: color,
        width: `${width * 4}px`,
      };
      return (
        <div className="stat" key={name}>
          <img alt={name} className="stat-icon" src={icon} />
          <div className="stat-bar" style={statStyle} />
        </div>
      );
    });
    const titleSection = pokemonLoading ? (
      <img alt="pikachu" src="images/pikachu.gif" />
    ) : (
      <h1>{pokemonName}</h1>
    );
    const main = appLoading ? (
      <div className="loading">
        <img alt="loading" src="images/loading.gif" />
      </div>
    ) : (
      <div className="container">
        <div className="title-section">
          {titleSection}
        </div>
        <div className="info">
          <div className="pokemon-section">
            { sprite ? <img alt={name} src={sprite} /> : null }
          </div>
          <div className="stats-info">
            {statsInfo}
          </div>
        </div>
        <div role="button" tabIndex={0} onClick={() => this.pokeballClicked()}>
          <img
            alt="pokeball"
            className="pokeball"
            src={pokeball}
          />
        </div>
      </div>
    );
    return (
      <div className="App">
        <div className="App-header">
          <h2>Pokemon Testing</h2>
        </div>
        <div className="App-intro">
          {main}
        </div>
      </div>
    );
  }
}

export default App;
