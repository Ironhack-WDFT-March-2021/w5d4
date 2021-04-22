const getDataForCountry = country => {
    // we make the request to the restcountries api
    // using the fetch api - that is built in to javascript
    // fetch(`https://restcountries.eu/rest/v2/name/${country}`)
    //     .then(response => response.json())
    //     .then(data => console.log(data))


    // using axios
    axios.get(`https://restcountries.eu/rest/v2/name/${country}`)
        .then(response => {
            console.log(response.data[0]);
            const countryDetails = response.data[0];
            // we update the dom
            // set the country name
            document.querySelector('#country-name').innerText = countryDetails.name;
            // set population
            document.querySelector('#country-population').innerText = countryDetails.population;
            // set the flag
            document.querySelector('#country-flag').setAttribute('src', countryDetails.flag);
        })


}

document.querySelector('button').onclick = () => {
    const userInput = document.querySelector('#name').value;
    console.log(userInput);
    getDataForCountry(userInput);
}