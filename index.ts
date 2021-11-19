import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import _ from 'lodash';
const superheroApiUrl = process.env.SUPERHERO_API_URL

exports.handler = async (event: any) => {
// const main = async (event: any) => {

    // first thing, get the two superheros who are competing
    const firstHeroName = event['queryStringParameters']['firstHeroName'];
    const secondHeroName = event['queryStringParameters']['secondHeroName'];

    // TODO: definitely type the Axios response
    const firstHeroResults: any = await getHeroData(firstHeroName);
    const secondHeroResults: any = await getHeroData(secondHeroName);
 
    let firstHeroData: any = firstHeroResults.data.results ? firstHeroResults.data.results[0] : undefined
    let secondHeroData: any = secondHeroResults.data.results? secondHeroResults.data.results[0] : undefined

    if (!_.isUndefined(firstHeroData) && !_.isUndefined(secondHeroData)) {
         // if both exist, deathmatch
        const firstHeroPowerStats = firstHeroData.powerstats;
        const firstHeroFoundName = firstHeroData.name;
        const firstHeroRealName = firstHeroData.biography['full-name']
        const firstHeroProfile = firstHeroData.image.url;

        const secondHeroPowerStats = secondHeroData.powerstats;
        const secondHeroFoundName = secondHeroData.name;
        const secondHeroRealName = secondHeroData.biography['full-name']
        const secondHeroProfile = secondHeroData.image.url;

        const comparison = comparePowerStats({
            heroName: firstHeroFoundName,
            powerstats: firstHeroPowerStats
        }, {
            heroName: secondHeroFoundName,
            powerstats: secondHeroPowerStats
        });

        console.log(comparison)
    } else if (_.isUndefined(firstHeroData) && _.isUndefined(secondHeroData)){
        // if both don't exist, fizzle,
        console.log(`We didn't find either hero, please check for a typo`)
    } else {
        // if one exists but not the other, that hero wins
        const existingHeroName = !_.isUndefined(firstHeroData) ? firstHeroData.name : secondHeroData.name
        console.log(`we only found ${existingHeroName}, so they win!`)
    }
    

};

async function getHeroData(heroName: string): Promise<any> {
    return await axios({
        method: 'GET',
        url: `${superheroApiUrl}/search/${heroName}`,
    });
}

function comparePowerStats(firstHeroData: any, secondHeroData: any) {
    const winnerTable: {
        [powerStat: string]: string
    } = {}
    for (const stat in firstHeroData.powerstats) {
        if (firstHeroData.powerstats[stat] === secondHeroData.powerstats[stat]) {
            winnerTable[stat] = 'tie'
        } else {
            winnerTable[stat] = firstHeroData.powerstats[stat] > secondHeroData.powerstats[stat] ? firstHeroData.heroName : secondHeroData.heroName
        }
    };
    return winnerTable
}

// For Testing
/*
main({
    queryStringParameters: {
        firstHeroName: 'spider-man',
        secondHeroName: 'superman'
    },
});
 */

type Powerstats = {
    intelligence: number,
    strength: number,
    speed: number,
    durability: number,
    power: number,
    combat: number
};


