const Api_key='63f04d892d3d0fe18f5df5633dcd5112'

const formatTemp= (temp)=>{
    temp=temp.toFixed(1)+"°";
    return temp
}
const getIconUrl= (icon)=>`http://openweathermap.org/img/wn/${icon}@2x.png`

const getCurrentWeatherData=async ()=> {
    const city= "Delhi";
    const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Api_key}&units=metric`)
    return response.json()
}

const loadCurrentWeatherData=({name, main:{temp, temp_min, temp_max}, weather:[{description, icon}]})=>{
    temp=formatTemp(temp);
    const currentElement=document.querySelector("#current_forecast");
    currentElement.querySelector(".city").textContent=name;
    currentElement.querySelector(".temp").textContent=temp;
    currentElement.querySelector(".description").textContent=description;
    currentElement.querySelector(".min-max-temp").textContent=`⬆${formatTemp(temp_min)} ⬇${formatTemp(temp_max)}`;
    currentElement.querySelector("#icon").src=`http://openweathermap.org/img/wn/${icon}@2x.png`;
}

const getHourlyWeatherData=async ({name:city})=>{
    const response= await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${Api_key}&units=metric`);
    const data= await response.json();
    return data.list.map(el=>{
        const {main:{temp, temp_min, temp_max}, weather:[{description,icon}], dt_txt}= el;

        return {temp,temp_min,temp_max,description,icon,dt_txt}
    })    

}

const loadHourlyWeatherData= (list)=>{
    const hourlyElement= document.querySelector("#hourly_forecast .hourly-container");
    let content=[]
    for (let i=1;i<13;i++){
        const time=list[i].dt_txt.split(" ")[1].slice(0,5)
        content.push(`<article>
        <p class="hourly-time">${time}</p>
        <img class="hourly-icon" src=${getIconUrl(list[i].icon)} alt=""> 
        <p class="hourly-temp">${formatTemp(list[i].temp)}</p> 
        </article>`)
    }
    hourlyElement.innerHTML=content.join("");
}

const loadWindData= ({wind:{speed}, main:{humidity}})=>{
    const windElement= document.querySelector("#wind");
    windElement.querySelector(".wind-speed").innerHTML=speed+" m/s";
    console.log(windElement)
}

const loadHumidity=({main:{humidity}})=>{
    const humidityElement=document.querySelector("#humidity .humidity-data");
    humidityElement.innerHTML= `${humidity} %`;
}

document.addEventListener("DOMContentLoaded", async()=>{
    const currentWeather= await getCurrentWeatherData();
    loadCurrentWeatherData(currentWeather)
    const hourlyWeather= await getHourlyWeatherData(currentWeather)
    loadHourlyWeatherData(hourlyWeather)
    loadWindData(currentWeather)
    loadHumidity(currentWeather)



})