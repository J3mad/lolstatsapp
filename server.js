const express = require('express');
const app = express();
const request = require('sync-request');

const RiotAPIURL = 'https://na1.api.riotgames.com';
const APIKey = '?api_key=RGAPI-ea6bb181-fd0d-456c-b541-72c46c5da70e';

function getSummonerSpells(spell1Id, spell2Id) {
    let summonerSpell1Id = String(spell1Id);
    let summonerSpell2Id = String(spell2Id);

    let res = request('GET', 'https://ddragon.leagueoflegends.com/cdn/8.15.1/data/en_US/summoner.json');
    let summonerSpells = JSON.parse(res.getBody('utf8'));
    let ret = ['', ''];

    for (let summonerSpellId in summonerSpells.data) {
        if (summonerSpells.data[summonerSpellId].key === summonerSpell1Id) {
            ret[0] = summonerSpells.data[summonerSpellId].name;
        }
        else if (summonerSpells.data[summonerSpellId].key === summonerSpell2Id) {
            ret[1] = summonerSpells.data[summonerSpellId].name;
        }
    }

    return ret;
}

function getChampionName(id) {
    let idStr = String(id);
    let res = request('GET', 'https://ddragon.leagueoflegends.com/cdn/8.15.1/data/en_US/champion.json');
    let champions = JSON.parse(res.getBody('utf8'));

    for (let championName in champions.data) {
        if (champions.data[championName].key === idStr) {
            return championName;
        }
    }

    return '';
}

function getItemsName(itemIds) {
    let res = request('GET', 'https://ddragon.leagueoflegends.com/cdn/8.15.1/data/en_US/item.json');
    let items = JSON.parse(res.getBody('utf8'));

    let ret = new Array();
    for (let i = 0;i < itemIds.length;++i) {
        if (itemIds[i] === 0) {
            ret.push('');
        }
        else {
            let idStr = String(itemIds[i]);
            ret.push(items.data[idStr].name);
        }
    }

    return ret;
}

function getMatchListBySummmonerName(name, count) {
    let res = request('GET', RiotAPIURL + '/lol/summoner/v3/summoners/by-name/' + name + APIKey);
    let summonerInfo = JSON.parse(res.getBody('utf8'));
    
    res = request('GET', RiotAPIURL + '/lol/match/v3/matchlists/by-account/' + summonerInfo.accountId + APIKey);
    let matchList = JSON.parse(res.getBody('utf8')).matches;
    let matches = new Array();

    for(let i = 0; i < count;++i)
    {
        res = request('GET', RiotAPIURL + '/lol/match/v3/matches/' + matchList[i].gameId + APIKey);
        let match = JSON.parse(res.getBody('utf8'));
        match.participantIdentities.forEach(participantIdentity => {
            if (participantIdentity.player.accountId == summonerInfo.accountId)
            {
                let participant = match.participants[participantIdentity.participantId];

                let matchObj = new Object();
                matchObj['outcome'] = participant.stats.win?"Victory":"Defeat";
                matchObj['gameLength'] = match.gameDuration;
                matchObj['summonerName'] = participantIdentity.player.summonerName;
                matchObj['summonerSpells'] = getSummonerSpells(participant.spell1Id, participant.spell2Id);
                matchObj['championPlayed'] = getChampionName(participant.championId);
                matchObj['kda'] = participant.stats.kills + '/' + participant.stats.deaths + '/' + participant.stats.assists;
                matchObj['items'] = getItemsName([participant.stats.item0, participant.stats.item1, participant.stats.item2, participant.stats.item3, participant.stats.item4, participant.stats.item5, participant.stats.item6]);
                matchObj['championLevel'] = participant.stats.champLevel;
                matchObj['totalCreepScore'] = participant.stats.totalMinionsKilled;
                matchObj['CreepScorePerMin'] = participant.stats.totalMinionsKilled * 60.0 / match.gameDuration;

                matches.push(matchObj);
            }
        });
    }

    return matches;
}

app.get('/:name', (req, res) => {
    let name = req.params.name;
    res.json(JSON.stringify(getMatchListBySummmonerName(name, 5)));
});

app.listen(8080, () => console.log('Example app listening on port 8080!'));