var type= 'metar', text = 'VEBS';
var inp = document.querySelectorAll('input');
var d2 = document.querySelector('.d2');

async function main() {
   const url = `https://avwx.rest/api/${type}/${text}?token=2r_H32HZ2AzCZDotC-1GetnWkIZhkBMpdq2W3rLRabI`;
   const res = await fetch(url);
   if(!res.ok)
      alert('Error: '+res.status);
   const data = await res.json();
   console.log(data)
   
   if(type == 'metar') {
      var flc = data.flight_rules;
      d2.innerHTML = `Type: ${type.toUpperCase()} <br>
                           Remark: ${data.remarks} <br>
                           Airport: ${data.station} <br>
                           ICAO Code: ${data.station} <br>
                           Report time: ${getIST(data.time.dt)} <br>
                           Temperature: ${data.temperature.value}°C <br>
                           Dewpoint: ${data.dewpoint.value}°C <br>
                           Humidity: ${(data.relative_humidity*100).toFixed(0)}% <br>
                           Wind: ${data.wind_speed.value} Knot(s) (${(data.wind_speed.value*1.85).toFixed(0)} KM/H - ${data.wind_direction.value}°) <br>`;
      if(data.wind_gust)
         d2.innerHTML += `Gust: ${data.wind_gust} Knot(s)`;
      if(data.visibility)
         if(data.units.visibility == 'm')
            d2.innerHTML += `Visibility: ${(data.visibility.value/1000).toFixed(0)} Km <br>`;
         else
            d2.innerHTML += `Visibility: ${(data.visibility.value*1.609).toFixed(0)} Sm <br>`;
      if(data.units.altimeter == 'hPa')
         d2.innerHTML += `Pressure: ${data.altimeter.value} hPa <br>`;
      else
         d2.innerHTML += `Pressure: ${data.altimeter.value} mmHg <br>`;
      if(data.wx_codes.length)
         d2.innerHTML += `Condition: ${data.wx_codes[0].value} <br>`;
      d2.innerHTML += `Clouds: `;
      if(!data.clouds.length)
         d2.innerHTML += ' Clear skies. <br>';
      else {
         ul = document.createElement('ul');
         for(i = 0; i < data.clouds.length; i++) {
            li = document.createElement('li');
            li.innerHTML = data.clouds[i].type+' at '+data.clouds[i].altitude*100+' ft AGL';
            if(data.clouds[i].modifier)
               li.innerHTML += ` (${data.clouds[i].modifier})`;
            ul.appendChild(li);
         }
         d2.appendChild(ul);
      }
      d2.innerHTML += `Raw: ${data.raw} <br>
                           Category: ${flc}`;
      var fl = document.createElement('div');
      fl.id = 'fl';
      fl.style.background =
       flc == 'VFR' ? 'Green': flc == 'MVFR' ? 'Blue' : flc == 'LIFR' ? 'Magenta' : 'Red';
      d2.appendChild(fl);
   } else if(type == 'taf') {
      var frst = data.forecast;
      d2.innerHTML = 'Type: ' + type.toUpperCase();
      if(data.remarks)
         d2.innerHTML += '<br>Remarks: '+data.remarks;
      d2.innerHTML += `<br>ICAO: ${data.station} <br>
                           Issued: ${getIST(data.time.dt)} <br>
                           Span: ${getIST(data.start_time.dt)} until ${getIST(data.end_time.dt)} <br>`;
      for(i = 0; i < frst.length; i++) {
         span = document.createElement('span');
         span2 = document.createElement('span');
         if(frst[i].type) {
            span.innerHTML = `${frst[i].type} from ${getIST(frst[i].start_time.dt)} to ${getIST(frst[i].end_time.dt)}`;
            if (frst[i].probability)
               span.innerHTML = ` (${frst[i].probability}% likely)`;
         } else
            span.innerHTML = `Forecast from ${getIST(frst[i].start_time.dt)} to ${getIST(frst[i].end_time.dt)}`;
         if (frst[i].wind_speed) {
            li = document.createElement('li');
            li.innerHTML += `<br>Wind: ${frst[i].wind_speed.value} Knot(s) (${(frst[i].wind_speed.value*1.85).toFixed(1)} KM/H - ${frst[i].wind_direction.value}°)`;
            span2.appendChild(li);
         } if (frst[i].wx_codes) {
            li = document.createElement('li');
            li.innerHTML += `<br>Weather: ${frst[i].wx_codes[0].value}`;
            span2.appendChild(li);
         } if (frst[i].visibility) {
            li = document.createElement('li')
            if(frst[i].units.visibility == 'sm')
               li.innerHTML += `<br>Visibility: ${frst[i].visibility.value} mile(s) (${(frst[i].visibility.value*1.609).toFixed(1)} Km)`;
            else
               li.innerHTML += `<br>Visibility: ${(frst[i].visibility.value/1000).toFixed(1)} Km`;
            span2.appendChild(li);
         } if (frst[i].clouds.length) {
            var clouds = frst[i].clouds;
            ul = document.createElement('ul');
            for(j = 0; j < clouds.length; j++) {
               li = document.createElement('li');
               li.innerHTML = `${clouds[j].type} at ${clouds[j].altitude} ft AGL`;
               if (clouds[j].modifier)
                  li.innerHTML = `${clouds[j].type} at ${clouds[j].altitude} ft (${clouds[j].modifier}) AGL`;
               ul.appendChild(li);
            }
            span2.appendChild(ul);
         }
         d2.appendChild(span);
         d2.appendChild(span2);
      }
      d2.innerHTML += 'Raw: '+data.raw;
   } else if(type == 'station') {
      d2.innerHTML = `Name: ${data.name}, ${data.city}, ${data.state}, ${data.country} <img src="https://flagcdn.com/24x18/${data.country.toLowerCase()}.png"> <br>
                     IATA: ${data.iata} <br>
                     ICAO: ${data.icao} <br>
                     Reporting: ${data.reporting?'Yes':'No'} <br>`;
      for(i = 0; i < data.runways.length; i++) {
         var rny = data.runways[i];
         var span = document.createElement('span');
         var ul = document.createElement('ul');
         span.innerHTML = 'Runway '+(i+1)+':-';
         ul.innerHTML = `<li>Surface: ${rny.surface}</li>
                        <li>Numbers: ${rny.ident1} & ${rny.ident2}</li>
                        <li>Length: ${rny.length_ft}ft</li>
                        <li>Width: ${rny.width_ft}ft</li>
                        <li>Lights: ${rny.lights} </li>`;
         span.appendChild(ul);
         d2.appendChild(span);
      }
      d2.innerHTML += `Website: <a href='${data.wiki}'>Visit</a>`;
   }
}
async function search() {
   //airport=true&reporting=true
   const url = `https://avwx.rest/api/search/station?text=${text}&token=2r_H32HZ2AzCZDotC-1GetnWkIZhkBMpdq2W3rLRabI`;
   const res = await fetch(url);
   if(!res.ok)
      alert('Error: '+res.status);
   const data = await res.json();
   
   d2.innerHTML = '';
   for(i = 0; i < data.length; i++) {
      var sp = document.createElement('span');
      sp.innerHTML = (i+1)+`. Name: ${data[i].name}, ${data[i].city}, ${data[i].state}, ${data[i].country} <img src="https://flagcdn.com/24x18/${data[i].country.toLowerCase()}.png"> <br>
                     IATA: ${data[i].iata} <br>
                     ICAO: ${data[i].icao} <br>
                     Reporting: ${data[i].reporting?'Yes':'No'} <br>`;
      for(j = 0; j < data[i].runways.length; j++) {
         var rny = data[i].runways[j];
         var span = document.createElement('span');
         var ul = document.createElement('ul');
         span.innerHTML = 'Runway '+(j+1)+':-';
         ul.innerHTML = `<li>Surface: ${rny.surface}</li>
                        <li>Numbers: ${rny.ident1} & ${rny.ident2}</li>
                        <li>Length: ${rny.length_ft} ft</li>
                        <li>Width: ${rny.width_ft} ft</li>
                        <li>Lights: ${rny.lights} </li>`;
         span.appendChild(ul);
         sp.appendChild(span);
      }
      d2.appendChild(sp);
      d2.innerHTML += `Website: <a href='${data[i].website}'>Visit</a><br><br>`;
   }
}
async function nearest() {
   //airport=true&reporting=true
   const url = `https://avwx.rest/api/station/near/${text}?token=2r_H32HZ2AzCZDotC-1GetnWkIZhkBMpdq2W3rLRabI`;
   const res = await fetch(url);
   if(!res.ok)
      alert('Error: '+res.status);
   const data = await res.json();
   
   console.log(data)
}

function get() {
   if(!inp[0].value) {
      alert('Enter query!');
      return;
   }
   text = inp[0].value;
   type = inp[1].checked?'metar':inp[2].checked?'taf':inp[3].checked?'station':'';
   if(inp[4].checked)
      text = text.replace(' ', '%20');
   (inp[1].checked||inp[2].checked||inp[3].checked) && main();
   inp[4].checked && search();
   inp[5].checked && nearest();
}
function info() {
   alert('Info:- Get information about an airport.\nSearch:- Get stations by ICAO, IATA, name, city, and state.\nNearest:- Get station by coordinates.');
}

function getIST(date) {
   if (typeof date == 'string')
      return new Date(new Date(date).getTime()).toLocaleString();
   else
      return new Date(date*1000).toLocaleString();
}

inp[0].addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("button").click();
  }
});
