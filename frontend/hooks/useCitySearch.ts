import { useState } from 'react';
import jsonData from '@/countries+states+cities.json';

export interface City {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    state?: string;
}

export interface State {
    id: number;
    name: string;
    state_code: string;
    latitude: string;
    longitude: string;
    cities: City[];
}

export interface Country {
    id: number;
    name: string;
    iso3: string;
    iso2: string;
    phone_code: string;
    capital: string;
    currency: string;
    currency_symbol: string;
    tld: string;
    native: string;
    region: string;
    subregion: string;
    timezones: any[];
    translations: any;
    latitude: string;
    longitude: string;
    emoji: string;
    emojiU: string;
    states: State[];
}

export interface LocationData {
    city: string;
    state: string;
    country: string;
}

export const useCitySearch = () => {
    const [searchText, setSearchText] = useState('');
    const [filteredCities, setFilteredCities] = useState<(City & { state: string })[]>([]);
    const countriesData: Country[] = jsonData as Country[];

    const searchCities = (text: string) => {
        setSearchText(text);
        if (text.length > 2) {
            const filtered = countriesData[0].states.flatMap((state) =>
                state.cities
                    .filter((city) => city.name.toLowerCase().includes(text.toLowerCase()))
                    .map((city) => ({ ...city, state: state.name }))
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities([]);
        }
    };

    const selectCity = (city: City & { state: string }) => {
        const locationString = `${city.name}, ${city.state}`;
        setSearchText(locationString);

        return {
            city: city.name,
            state: city.state,
            country: 'United States',
        };
    };

    return {
        searchText,
        setSearchText,
        filteredCities,
        setFilteredCities,
        searchCities,
        selectCity,
    };
};