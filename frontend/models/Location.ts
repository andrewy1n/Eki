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