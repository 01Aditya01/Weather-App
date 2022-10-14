const Api_key='63f04d892d3d0fe18f5df5633dcd5112'
let lon;
let lat;

const formatTemp= (temp)=>{
    temp=`${temp.toFixed(1)}°`;
    return temp
}
const getIconUrl= (icon)=>`https://openweathermap.org/img/wn/${icon}@2x.png`

const getCities = async(city)=>{
    const response= await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${Api_key}`);
    return response.json()
}

const debounce= function(){
    let timer;
    return (event)=>{
        clearTimeout(timer);
        timer=setTimeout(()=>{onSearchInput(event)}, 300);
    }
}();

const onSearchInput = async(event)=>{
    const city= event.target.value;
    if (city){
        const data = await getCities(city)
        const dataListElement= document.querySelector("#cities");
        let content=[]
        for (let {lat,lon,name,state,country} of data){
            content.push(`<option lat="${lat}" lon="${lon}" value="${name}, ${state? `${state},`:""} ${country}">`)
        }
        dataListElement.innerHTML=content.join("");
    }

}

const getCurrentWeatherData=async ()=> {
    const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${Api_key}&units=metric`)
    return response.json()
}

const loadCurrentWeatherData=({name, main:{temp, temp_min, temp_max}, weather:[{description, icon}]})=>{
    console.log(temp)
    temp=formatTemp(temp);
    const currentElement=document.querySelector("#current_forecast");
    currentElement.querySelector(".city").textContent=name;
    currentElement.querySelector(".temp").textContent=temp;
    currentElement.querySelector(".description").textContent=description;
    currentElement.querySelector(".min-max-temp").textContent=`⬆${formatTemp(temp_min)} ⬇${formatTemp(temp_max)}`;
    currentElement.querySelector("#icon").src=`https://openweathermap.org/img/wn/${icon}@2x.png`;
}

const getHourlyWeatherData=async ({name:city})=>{
    const response= await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${Api_key}&units=metric`);
    const data= await response.json();
    return data.list.map(el=>{
        const {main:{temp, temp_min, temp_max}, weather:[{description,icon}], dt_txt}= el;

        return {temp,temp_min,temp_max,description,icon,dt_txt}
    })    

}

const loadHourlyWeatherData= ({main:{temp: temp_now}, weather:[{icon: icon_now}]} ,list)=>{
    const hourlyElement= document.querySelector("#hourly_forecast .hourly-container");
    const timeFormatter= new Intl.DateTimeFormat("en", {hour:"numeric" ,hour12: true}).format;
    let content=[]
    content.push(`<article>
        <p class="hourly-time">Now</p>
        <img class="hourly-icon" src=${getIconUrl(icon_now)} alt=""> 
        <p class="hourly-temp">${formatTemp(temp_now)}</p> 
        </article>`)

    for (let i=2;i<10;i++){
        const time=new Date(list[i].dt_txt)
        content.push(`<article>
        <p class="hourly-time">${timeFormatter(time)}</p>
        <img class="hourly-icon" src=${getIconUrl(list[i].icon)} alt=""> 
        <p class="hourly-temp">${formatTemp(list[i].temp)}</p> 
        </article>`)
    }
    hourlyElement.innerHTML=content.join("");
}

const days=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months=["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
const getDailyWeatherData= (list)=>{
    let dayWiseForecast= new Map()
    for (let hour of list){
        let [date]= hour.dt_txt.split(" ");
        const day= days[new Date(date).getDay()];
        if (dayWiseForecast.has(day)){
            let dayData= dayWiseForecast.get(day)
            dayData.push(hour)
        }
        else{
            dayWiseForecast.set(day, [hour])
        }

    }
    arr= new Array();
    for ([key,value] of dayWiseForecast){
        temp_min=Math.min(...value.map(obj=>obj.temp_min))
        temp_max=Math.max(...value.map(obj=>obj.temp_max))
        const firstHour=value.find(obj=>obj.icon&&obj.description)
        // let dt_txt.slice(5,7)
        let forecastDate= `${months[(firstHour.dt_txt.slice(5,7))-1]} ${firstHour.dt_txt.slice(8,10)}`;
        arr.push({day:key,forecastDate,temp_min,temp_max,icon:firstHour.icon,description: firstHour.description })
    }
    return arr
}

const loadDailyWeatherData= (dailyList)=>{
    const dailyElement= document.querySelector("#daily_forecast .daily-container")
    let dailyContent=[]
    const today=dailyList[0]
    dailyContent.push(`
        <article class="daily-grid-element">
            <p class="day">Today</p>
            <p class="date">${today.forecastDate}</p>
            <img class="daily-icon" src=${getIconUrl(today.icon)} alt="">
            <div class="description-container">
                <p class="daily-description">${today.description}</p>
            </div>
        </article>`
    )
    
    for (let i=1; i<dailyList.length;i++){
        dailyContent.push(`
        <article class="daily-grid-element">
            <p class="day">${dailyList[i].day}</p>
            <p class="date">${dailyList[i].forecastDate}</p>
            <img class="daily-icon" src=${getIconUrl(dailyList[i].icon)} alt="">
            <div class="description-container">
                <p class="daily-description">${dailyList[i].description}</p>
            </div>
        </article>`)
    }
    dailyContent.push(`<div class="graph">
    <canvas id="max-min-graph"></canvas>
    </div>`)
    dailyElement.innerHTML= dailyContent.join("")

}

const loadWindData= ({wind:{speed}, main:{humidity}})=>{
    const windElement= document.querySelector("#wind");
    windElement.querySelector(".wind-speed").innerHTML=speed+" m/s";
}

const loadHumidity=({main:{humidity}})=>{
    const humidityElement=document.querySelector("#humidity .humidity-data");
    humidityElement.innerHTML= `${humidity} %`;
}

const correctDescriptionWidth= element=>{
    x=element.scrollWidth-70
    element.style.transform= `translate(${-x}px,0px)`;
    element.style.transitionDuration=`${x/35}s`
    element.style.transitionTimingFunction= "linear"
    let delay = (x/35)*1000+800
    
    setTimeout(()=>{
        element.style.transitionDuration="0s"
        element.style.transform= "translate(0px,0px)"},delay)
}

const checkDescriptionWidth= ()=>{
    dailyDescriptionList= document.querySelectorAll(".daily-description")
    descriptionContainer= document.querySelector(".description-container")
    
    for (let i=0; i<dailyDescriptionList.length;i++){
        descriptionWidth=dailyDescriptionList[i].scrollWidth
        if (descriptionWidth> descriptionContainer.clientWidth){
            correctDescriptionWidth(dailyDescriptionList[i])
            setInterval(correctDescriptionWidth,(descriptionWidth-70)*1000/35+1200,dailyDescriptionList[i])
        }
    }
}

const loadGraph= (dailyList)=>{
    Chart.register(ChartDataLabels);

    var ctx = document.querySelector("#max-min-graph")
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["","","","","",""],
            datasets: [{
                label: "min temp",
                data: dailyList.map(obj=>obj.temp_min),
                borderWidth: 2,
                borderColor: "hsl(200,80%,70%)",
                fill: {target: "1", below: "hsl(180, 0%,80%,0.2)"},
                datalabels:{
                    align: "bottom",
                    formatter: function(value) {
                        return formatTemp(value);
                      },
                                         
                }
            },
            {
                label: "max temp",
                data: dailyList.map(obj=>obj.temp_max),
                borderWidth: 2,
                borderColor: "hsl(15, 80%, 70%)",
                // fill: true,
                datalabels:{
                    align: "top",
                    formatter: function(value) {
                        return formatTemp(value);
                      }
                }
            }
        ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    display: false,
                    
                },
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20
                }
            }
          },
   
            
    }
    );
}

const getCityCoordinates= (event)=>{
    const searchValue=event.target.value;
    const selectedOption= document.querySelector(`#cities >option[value="${searchValue}"]`)
    if (selectedOption){
        lat=selectedOption.getAttribute("lat");
        lon=selectedOption.getAttribute("lon");
        loadCityForecast()
    }
}

const loadCityForecast = async()=>{
    console.log("working")
    const currentWeather= await getCurrentWeatherData();
    loadCurrentWeatherData(currentWeather)
    const hourlyWeather= await getHourlyWeatherData(currentWeather)
    loadHourlyWeatherData(currentWeather, hourlyWeather)
    const dailyWeather= getDailyWeatherData(hourlyWeather)
    loadDailyWeatherData(dailyWeather)
    loadGraph(dailyWeather)
    loadWindData(currentWeather)
    loadHumidity(currentWeather)
    checkDescriptionWidth()
}

const getCurrentLocation =(position)=>{
    lat = position.coords.latitude
    lon = position.coords.longitude
    loadCityForecast()
}

document.addEventListener("DOMContentLoaded", async()=>{

    const searchElement=document.querySelector("#search")
    searchElement.addEventListener("input",debounce);
    searchElement.addEventListener("change",getCityCoordinates)
    const coordinates=navigator.geolocation.getCurrentPosition(getCurrentLocation);
    

})