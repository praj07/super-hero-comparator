import axios from 'axios';
const superheroApiUrl = process.env.SUPERHERO_API_URL

export async function getSuperHeroData(superHeroName: string) {
    const firstHeroResults: any = await getHeroData(superHeroName);
    let firstHeroData: any = firstHeroResults.data.results ? firstHeroResults.data.results[0] : undefined

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
