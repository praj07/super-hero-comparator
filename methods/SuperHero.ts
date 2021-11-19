import axios from 'axios';
const superheroApiUrl = process.env.SUPERHERO_API_URL

/**
 * function to get the hero data and process
 * @param superHeroName 
 * @returns 
 */
export async function getSuperHeroData(superHeroName: string) {
    const heroResults: any = await getHeroData(superHeroName);
    let heroData: any = heroResults.data.results ? heroResults.data.results[0] : undefined
    return heroData
};

/**
 * creates a comparison map to find which hero wins in all specific power stat categories
 * @param firstHeroData 
 * @param secondHeroData 
 * @returns 
 */
 export function comparePowerStats(firstHeroData: any, secondHeroData: any) {
    const winnerMap: {
        [powerStat: string]: string
    } = {};
    let runningCount = 0;
    for (const stat in firstHeroData.powerstats) {
        const firstHeroStat = parseInt(firstHeroData.powerstats[stat]);
        const secondHeroStat = parseInt(secondHeroData.powerstats[stat]);
        // we'll use this to keep track of which hero wins more of the stats
        // -ve means hero 2 wins, +ve means hero 1 wins
        if (firstHeroStat === secondHeroStat) {
            winnerMap[stat] = 'tie'
        } else {
            if (firstHeroStat > secondHeroStat ) {
                winnerMap[stat] = firstHeroData.heroName;
                runningCount++;
            } else {
                winnerMap[stat] = secondHeroData.heroName;
                runningCount--;
            }
        }
    };
    return {
        winnerMap,
        runningCount
    }
};


/**
 * Make HTTP request to superhero API to best attempt find the hero that was requested
 * @param heroName 
 * @returns 
 */
 async function getHeroData(heroName: string): Promise<any> {
    return await axios({
        method: 'GET',
        url: `${superheroApiUrl}/search/${heroName}`,
    });
};