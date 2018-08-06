import React, { Component } from 'react';
import './App.css';

class SummonerNameInput extends Component {
  constructor(props) {
      super(props);
      this.state = { summonerName: ''};

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({summonerName: event.target.value});
  }

  handleSubmit(event) {
    this.props.onMatchesFetched([]);

    fetch('/' + this.state.summonerName)
    .then(res => res.json())
    .then(matches => this.props.onMatchesFetched(JSON.parse(matches)));
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          SummonerName:
          <input type="text" name="name" onChange={this.handleChange} />
        </label>
        <input type="submit" value="Search" />
      </form>
    );
  }
}

function MatchRow(props) {
  const match = props.match;
  return (
    <tr>
      <td>{match.outcome}</td>
      <td>{match.gameLength}</td>
      <td>{match.summonerName}</td>
      <td>{match.summonerSpells[0]} - {match.summonerSpells[1]}</td>
      <td>{match.championPlayed}</td>
      <td>{match.kda}</td>
      <td>{match.items[0]}-{match.items[1]}-{match.items[2]}-{match.items[3]}-{match.items[4]}-{match.items[5]}-{match.items[6]}</td>
      <td>{match.championLevel}</td>
      <td>{match.totalCreepScore}</td>
      <td>{match.creepScorePerMin}</td>
    </tr>
  );
}

function MatchTable(props) {
  const matches = props.matches;
  const rows = matches.map((match) =>
    <MatchRow key={match.id} match={match} />
  );
  return (
    <table>
      <thead>
        <tr>
          <td>Outcome</td>
          <td>Game Length</td>
          <td>Summoner Name</td>
          <td>Summoner Spells</td>
          <td>Champion Played</td>
          <td>KDA</td>
          <td>Items</td>
          <td>Champion Level</td>
          <td>Total Creep Score</td>
          <td>Creep Score Per Min</td>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
          matches: []
      };

      this.onMatchesFetched = this.onMatchesFetched.bind(this);
  }

  onMatchesFetched(data) {
    this.setState({matches: data});
  }

  render() {
    return (
      <div className="App">
        <SummonerNameInput onMatchesFetched={this.onMatchesFetched}/>
        <br />
        <MatchTable matches = {this.state.matches} />
      </div>
    );
  }
}

export default App;
