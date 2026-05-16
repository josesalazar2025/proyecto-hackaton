const capitales = [
    {
        "pais_codigo": "GB",
        "pais": "United Kingdom",
        "capital": "London",
        "latitud": 51.5074456,
        "longitud": -0.1277653,
        "poblacion": "8908083",
        "wikidata": "Q84"
    },
    {
        "pais_codigo": "NZ",
        "pais": "New Zealand",
        "capital": "Wellington",
        "latitud": -41.2887953,
        "longitud": 174.7772114,
        "poblacion": "215900",
        "wikidata": "Q23661"
    },
    {
        "pais_codigo": "GR",
        "pais": "Greece",
        "capital": "Athens",
        "latitud": 37.9755648,
        "longitud": 23.7348324,
        "poblacion": "3090508",
        "wikidata": "Q1524"
    },
    {
        "pais_codigo": "SI",
        "pais": "Slovenia",
        "capital": "Ljubljana",
        "latitud": 46.0500268,
        "longitud": 14.5069289,
        "poblacion": "285604",
        "wikidata": "Q437"
    },
    {
        "pais_codigo": "DK",
        "pais": "Denmark",
        "capital": "Kobenhavn",
        "latitud": 55.6867243,
        "longitud": 12.5700724,
        "poblacion": "613288",
        "wikidata": "Q1748"
    },
    {
        "pais_codigo": "IN",
        "pais": "India",
        "capital": "New Delhi",
        "latitud": 28.6138954,
        "longitud": 77.2090057,
        "poblacion": "249998",
        "wikidata": "Q987"
    },
    {
        "pais_codigo": "AT",
        "pais": "Austria",
        "capital": "Vienna",
        "latitud": 48.2083537,
        "longitud": 16.3725042,
        "poblacion": "2042036",
        "wikidata": "Q1741"
    },
    {
        "pais_codigo": "FR",
        "pais": "France",
        "capital": "Paris",
        "latitud": 48.8534951,
        "longitud": 2.3483915,
        "poblacion": "2133111",
        "wikidata": "Q90"
    },
    {
        "pais_codigo": "CH",
        "pais": "Switzerland",
        "capital": "Bern",
        "latitud": 46.9484742,
        "longitud": 7.4521749,
        "poblacion": "128848",
        "wikidata": "Q70"
    },
    {
        "pais_codigo": "CA",
        "pais": "Canada",
        "capital": "Ottawa",
        "latitud": 45.4208777,
        "longitud": -75.6901106,
        "poblacion": "934243",
        "wikidata": "Q1930"
    },
    {
        "pais_codigo": "IQ",
        "pais": "Irak",
        "capital": "Baghdad",
        "latitud": 33.3061701,
        "longitud": 44.3872213,
        "poblacion": "7216040",
        "wikidata": "Q1530"
    },
    {
        "pais_codigo": "ES",
        "pais": "Spain",
        "capital": "Madrid",
        "latitud": 40.416782,
        "longitud": -3.703507,
        "poblacion": "3477497",
        "wikidata": "Q2807"
    },
    {
        "pais_codigo": "AU",
        "pais": "Australia",
        "capital": "Canberra",
        "latitud": -35.2975906,
        "longitud": 149.1012676,
        "poblacion": "466566",
        "wikidata": "Q3114"
    },
    {
        "pais_codigo": "AF",
        "pais": "Afganistan",
        "capital": "Kabul",
        "latitud": 34.5269503,
        "longitud": 69.1850584,
        "poblacion": "3289000",
        "wikidata": "Q5838"
    },
    {
        "pais_codigo": "CN",
        "pais": "China",
        "capital": "Pekin",
        "latitud": 39.9057136,
        "longitud": 116.3912972,
        "poblacion": "21893095",
        "wikidata": "Q956"
    },
    {
        "pais_codigo": "ZA",
        "pais": "South Africa",
        "capital": "Praetorship",
        "latitud": -25.7459277,
        "longitud": 28.1879101,
        "poblacion": "741651",
        "wikidata": "Q3926"
    },
    {
        "pais_codigo": "TR",
        "pais": "Turkey",
        "capital": "Ankara",
        "latitud": 39.9207759,
        "longitud": 32.8540497,
        "poblacion": "5864049",
        "wikidata": "Q3640"
    },
    {
        "pais_codigo": "SK",
        "pais": "Sweden",
        "capital": "Stockholm",
        "latitud": 59.3251172,
        "longitud": 18.0710935,
        "poblacion": "984748",
        "wikidata": "Q1754"
    },
    {
        "pais_codigo": "IR",
        "pais": "Iran",
        "capital": "Tehran",
        "latitud": 35.6892523,
        "longitud": 51.3896004,
        "poblacion": "9930000",
        "wikidata": "Q3616"
    },
    {
        "pais_codigo": "UA",
        "pais": "Ukraine",
        "capital": "Київ",
        "latitud": 50.4500336,
        "longitud": 30.5241361,
        "poblacion": "2952301",
        "wikidata": "Q1899"
    },
    {
        "pais_codigo": "BY",
        "pais": "Belarus",
        "capital": "Мінск",
        "latitud": 53.9024716,
        "longitud": 27.5618225,
        "poblacion": "1995471",
        "wikidata": "Q2280"
    },
    {
        "pais_codigo": "CU",
        "pais": "Cuba",
        "capital": "Havana",
        "latitud": 23.135305,
        "longitud": -82.3589631,
        "poblacion": "1749964",
        "wikidata": "Q1563"
    },
    {
        "pais_codigo": "LV",
        "pais": "Letonia",
        "capital": "Rīga",
        "latitud": 56.9493977,
        "longitud": 24.1051846,
        "poblacion": "595053",
        "wikidata": "Q1773"
    },
    {
        "pais_codigo": "CD",
        "pais": "Democratic Republic of the Congo",
        "capital": "Kinshasa",
        "latitud": -4.32171,
        "longitud": 15.3122511,
        "poblacion": "17032322",
        "wikidata": "Q3838"
    },
    {
        "pais_codigo": "LT",
        "pais": "Lituania",
        "capital": "Vilnius",
        "latitud": 54.6870458,
        "longitud": 25.2829111,
        "poblacion": "581475",
        "wikidata": "Q216"
    },
    {
        "pais_codigo": "KG",
        "pais": "Kirguistan",
        "capital": "Бишкек",
        "latitud": 42.8761424,
        "longitud": 74.6036724,
        "poblacion": "1321900",
        "wikidata": "Q9361"
    },
    {
        "pais_codigo": "UZ",
        "pais": "Uzbekistan",
        "capital": "Toshkent",
        "latitud": 41.3123363,
        "longitud": 69.2787079,
        "poblacion": "2956384",
        "wikidata": "Q269"
    },
    {
        "pais_codigo": "TJ",
        "pais": "Tayikistan",
        "capital": "Душанбе",
        "latitud": 38.5767045,
        "longitud": 68.785433,
        "poblacion": "1178251",
        "wikidata": "Q9365"
    },
    {
        "pais_codigo": "MN",
        "pais": "Mongolia",
        "capital": "Ulaanbaatar",
        "latitud": 47.9184676,
        "longitud": 106.9177016,
        "poblacion": "1672627",
        "wikidata": "Q23430"
    },
    {
        "pais_codigo": "KZ",
        "pais": "Kazajistan",
        "capital": "Астана",
        "latitud": 51.1282205,
        "longitud": 71.4306682,
        "poblacion": "1601490",
        "wikidata": "Q1520"
    },
    {
        "pais_codigo": "NE",
        "pais": "Niger",
        "capital": "Niamey",
        "latitud": 13.524834,
        "longitud": 2.109823,
        "poblacion": "1026848",
        "wikidata": "Q3674"
    },
    {
        "pais_codigo": "AO",
        "pais": "Angola",
        "capital": "Luanda",
        "latitud": -8.8272699,
        "longitud": 13.2439512,
        "poblacion": "5172900",
        "wikidata": "Q3897"
    },
    {
        "pais_codigo": "ML",
        "pais": "Mali",
        "capital": "Bamako",
        "latitud": 12.649319,
        "longitud": -8.000337,
        "poblacion": "1809106",
        "wikidata": "Q3703"
    },
    {
        "pais_codigo": "TN",
        "pais": "Tunisia",
        "capital": "Tunisia",
        "latitud": 36.8002068,
        "longitud": 10.1857757,
        "poblacion": "728453",
        "wikidata": "Q3572"
    },
    {
        "pais_codigo": "LR",
        "pais": "Liberia",
        "capital": "Monrovia",
        "latitud": 6.3203562,
        "longitud": -10.8060492,
        "poblacion": "1010970",
        "wikidata": "Q3748"
    },
    {
        "pais_codigo": "CF",
        "pais": "Republica Centroafricana",
        "capital": "Bangui",
        "latitud": 4.3635118,
        "longitud": 18.5835913,
        "poblacion": "734350",
        "wikidata": "Q3832"
    },
    {
        "pais_codigo": "ZM",
        "pais": "Zambia",
        "capital": "Lusaka",
        "latitud": -15.4163395,
        "longitud": 28.2818414,
        "poblacion": "1742979",
        "wikidata": "Q3881"
    },
    {
        "pais_codigo": "BF",
        "pais": "Burkina Faso",
        "capital": "Ouagadougou",
        "latitud": 12.3681873,
        "longitud": -1.5270944,
        "poblacion": "1915102",
        "wikidata": "Q3777"
    },
    {
        "pais_codigo": "TD",
        "pais": "Chad",
        "capital": "N'Djaména",
        "latitud": 12.1191543,
        "longitud": 15.0502758,
        "poblacion": "1092066",
        "wikidata": "Q3659"
    },
    {
        "pais_codigo": "SN",
        "pais": "Senegal",
        "capital": "Dakar",
        "latitud": 14.693425,
        "longitud": -17.447938,
        "poblacion": "2396800",
        "wikidata": "Q3718"
    },
    {
        "pais_codigo": "SL",
        "pais": "Sierra Leona",
        "capital": "Freetown",
        "latitud": 8.479004,
        "longitud": -13.26795,
        "poblacion": "951000",
        "wikidata": "Q3780"
    },
    {
        "pais_codigo": "GN",
        "pais": "Guinea",
        "capital": "Conakry",
        "latitud": 9.5170602,
        "longitud": -13.6998434,
        "poblacion": "1660973",
        "wikidata": "Q3733"
    },
    {
        "pais_codigo": "GA",
        "pais": "Gabon",
        "capital": "Libreville",
        "latitud": 0.4086518,
        "longitud": 9.4418849,
        "poblacion": "850000",
        "wikidata": "Q3825"
    },
    {
        "pais_codigo": "ET",
        "pais": "Ethiopia",
        "capital": "Addis Ababa",
        "latitud": 9.0358287,
        "longitud": 38.7524127,
        "poblacion": "3500000",
        "wikidata": "Q3624"
    },
    {
        "pais_codigo": "GH",
        "pais": "Ghana",
        "capital": "Accra",
        "latitud": 5.5571096,
        "longitud": -0.2012376,
        "poblacion": "2388000",
        "wikidata": "Q3761"
    },
    {
        "pais_codigo": "MZ",
        "pais": "Mozambique",
        "capital": "Maputo",
        "latitud": -25.966213,
        "longitud": 32.56745,
        "poblacion": "1244227",
        "wikidata": "Q3889"
    },
    {
        "pais_codigo": "DJ",
        "pais": "Yibuti",
        "capital": "Djibouti",
        "latitud": 11.5936903,
        "longitud": 43.1472724,
        "poblacion": "475332",
        "wikidata": "Q3604"
    },
    {
        "pais_codigo": "KE",
        "pais": "Kenia",
        "capital": "Nairobi",
        "latitud": -1.2890006,
        "longitud": 36.8172812,
        "poblacion": "3138295",
        "wikidata": "Q3870"
    },
    {
        "pais_codigo": "MG",
        "pais": "Madagascar",
        "capital": "Antananarivo",
        "latitud": -18.9100122,
        "longitud": 47.5255809,
        "poblacion": "1391433",
        "wikidata": "Q3915"
    },
    {
        "pais_codigo": "SD",
        "pais": "Sudan",
        "capital": "Khartoum",
        "latitud": 15.5635972,
        "longitud": 32.5349123,
        "poblacion": "2682431",
        "wikidata": "Q1963"
    },
    {
        "pais_codigo": "CV",
        "pais": "Cape Verde",
        "capital": "Praia",
        "latitud": 14.9162811,
        "longitud": -23.5095095,
        "poblacion": "127832",
        "wikidata": "Q3751"
    },
    {
        "pais_codigo": "IL",
        "pais": "Israel",
        "capital": "Jerusalen",
        "latitud": 31.7788472,
        "longitud": 35.2257856,
        "poblacion": "780200",
        "wikidata": "Q1218"
    },
    {
        "pais_codigo": "EE",
        "pais": "Estonia",
        "capital": "Tallinn",
        "latitud": 59.437242,
        "longitud": 24.7572693,
        "poblacion": "462120",
        "wikidata": "Q1770"
    },
    {
        "pais_codigo": "ID",
        "pais": "Indonesia",
        "capital": "Jakarta",
        "latitud": -6.1754049,
        "longitud": 106.827168,
        "poblacion": "10467629",
        "wikidata": "Q3630"
    },
    {
        "pais_codigo": "LS",
        "pais": "Lesoto",
        "capital": "Maseru",
        "latitud": -29.310054,
        "longitud": 27.478222,
        "poblacion": "227880",
        "wikidata": "Q3909"
    },
    {
        "pais_codigo": "BW",
        "pais": "Botswana",
        "capital": "Gaborone",
        "latitud": -24.6581357,
        "longitud": 25.9088474,
        "poblacion": "231626",
        "wikidata": "Q3919"
    },
    {
        "pais_codigo": "NG",
        "pais": "Nigeria",
        "capital": "Abuja",
        "latitud": 9.0643305,
        "longitud": 7.4892974,
        "poblacion": "776298",
        "wikidata": "Q3787"
    },
    {
        "pais_codigo": "KR",
        "pais": "North of Korea",
        "capital": "Pyongyang",
        "latitud": 39.0167979,
        "longitud": 125.7473609,
        "poblacion": "3871335",
        "wikidata": "Q18808"
    },
    {
        "pais_codigo": "ZA",
        "pais": "South Africa",
        "capital": "Cape Town",
        "latitud": -33.9288301,
        "longitud": 18.4172197,
        "poblacion": "3740026",
        "wikidata": "Q5465"
    },
    {
        "pais_codigo": "NA",
        "pais": "Namibia",
        "capital": "Windhoek",
        "latitud": -22.5776104,
        "longitud": 17.0772739,
        "poblacion": "325858",
        "wikidata": "Q3935"
    },
    {
        "pais_codigo": "SO",
        "pais": "Somalia",
        "capital": "Mogadishu",
        "latitud": 2.0349312,
        "longitud": 45.3419183,
        "poblacion": "2610000",
        "wikidata": "Q2449"
    },
    {
        "pais_codigo": "BH",
        "pais": "Bahrain",
        "capital": "Manama",
        "latitud": 26.2235041,
        "longitud": 50.5822436,
        "poblacion": "157474",
        "wikidata": "Q3882"
    },
    {
        "pais_codigo": "CL",
        "pais": "Chili",
        "capital": "Santiago",
        "latitud": -33.4376995,
        "longitud": -70.6510671,
        "poblacion": "6139087",
        "wikidata": "Q2887"
    },
    {
        "pais_codigo": "LU",
        "pais": "Luxembourg",
        "capital": "Luxembourg",
        "latitud": 49.6112768,
        "longitud": 6.129799,
        "poblacion": "122273",
        "wikidata": "Q1842"
    },
    {
        "pais_codigo": "JM",
        "pais": "Jamaica",
        "capital": "Kingston",
        "latitud": 17.9712148,
        "longitud": -76.7928128,
        "poblacion": "660000",
        "wikidata": "Q34692"
    },
    {
        "pais_codigo": "EC",
        "pais": "Ecuador",
        "capital": "Quito",
        "latitud": -0.2201641,
        "longitud": -78.5123274,
        "poblacion": "2671191",
        "wikidata": "Q2900"
    },
    {
        "pais_codigo": "AD",
        "pais": "Andorra",
        "capital": "Andorra la Vella",
        "latitud": 42.5069391,
        "longitud": 1.5212467,
        "poblacion": "24678",
        "wikidata": "Q1863"
    },
    {
        "pais_codigo": "RW",
        "pais": "Ruanda",
        "capital": "Kigali",
        "latitud": -1.9534357,
        "longitud": 30.1140089,
        "poblacion": "1745555",
        "wikidata": "Q3859"
    },
    {
        "pais_codigo": "RS",
        "pais": "Serbia",
        "capital": "Belgrade",
        "latitud": 44.8178131,
        "longitud": 20.4568974,
        "poblacion": "1197714",
        "wikidata": "Q3711"
    },
    {
        "pais_codigo": "MX",
        "pais": "Mexico",
        "capital": "Mexico City",
        "latitud": 19.4326296,
        "longitud": -99.1331785,
        "poblacion": "9209944",
        "wikidata": "Q1489"
    },
    {
        "pais_codigo": "NP",
        "pais": "Nepal",
        "capital": "Karmandu",
        "latitud": 27.708317,
        "longitud": 85.3205817,
        "poblacion": "975000",
        "wikidata": "Q3037"
    },
    {
        "pais_codigo": "IT",
        "pais": "Italy",
        "capital": "Rome",
        "latitud": 41.8933203,
        "longitud": 12.4829321,
        "poblacion": "2864731",
        "wikidata": "Q220"
    },
    {
        "pais_codigo": "VN",
        "pais": "Vietnam",
        "capital": "Hanoi",
        "latitud": 21.0283334,
        "longitud": 105.854041,
        "poblacion": "8685607",
        "wikidata": "Q1858"
    },
    {
        "pais_codigo": "AR",
        "pais": "Argentina",
        "capital": "Buenos Aires",
        "latitud": -34.6095579,
        "longitud": -58.3887904,
        "poblacion": "3121707",
        "wikidata": "Q1486"
    },
    {
        "pais_codigo": "HU",
        "pais": "Hungary",
        "capital": "Budapest",
        "latitud": 47.4978789,
        "longitud": 19.0402383,
        "poblacion": "1686222",
        "wikidata": "Q1781"
    },
    {
        "pais_codigo": "TZ",
        "pais": "Tanzania",
        "capital": "Dodoma",
        "latitud": -6.1791181,
        "longitud": 35.7468174,
        "poblacion": "765179",
        "wikidata": "Q3866"
    },
    {
        "pais_codigo": "RO",
        "pais": "Rumania",
        "capital": "Bucharest",
        "latitud": 44.4361414,
        "longitud": 26.102684,
        "poblacion": "1883425",
        "wikidata": "Q19660"
    },
    {
        "pais_codigo": "SS",
        "pais": "South Sudan",
        "capital": "Juba",
        "latitud": 4.8459246,
        "longitud": 31.5959173,
        "poblacion": "372410",
        "wikidata": "Q1947"
    },
    {
        "pais_codigo": "VU",
        "pais": "Vanuatu",
        "capital": "Port Vila",
        "latitud": -17.7414972,
        "longitud": 168.3150163,
        "poblacion": "44039",
        "wikidata": "Q37806"
    },
    {
        "pais_codigo": "BS",
        "pais": "Bahamas",
        "capital": "Nassau",
        "latitud": 25.0782266,
        "longitud": -77.3383438,
        "poblacion": "259300",
        "wikidata": "Q2467"
    },
    {
        "pais_codigo": "LA",
        "pais": "Laos",
        "capital": "Vientian",
        "latitud": 17.9640988,
        "longitud": 102.6133707,
        "poblacion": "783000",
        "wikidata": "Q9326"
    },
        {
        "pais_codigo": "NO",
        "pais": "Norway",
        "capital": "Oslo",
        "latitud": 59.8937521,
        "longitud": 10.6203118,
        "poblacion": null,
        "wikidata": "Q585"
    },
    {
        "pais_codigo": "ME",
        "pais": "Montenegro",
        "capital": "Podgorica",
        "latitud": 42.4415238,
        "longitud": 19.2621081,
        "poblacion": "150799",
        "wikidata": "Q23564"
    },
    {
        "pais_codigo": "MD",
        "pais": "Moldavia",
        "capital": "Chișinău",
        "latitud": 47.0245117,
        "longitud": 28.8322923,
        "poblacion": "756900",
        "wikidata": "Q21197"
    },
    {
        "pais_codigo": "AM",
        "pais": "Armenia",
        "capital": "Երևան",
        "latitud": 40.1777112,
        "longitud": 44.5126233,
        "poblacion": "1106300",
        "wikidata": "Q1953"
    },
    {
        "pais_codigo": "US",
        "pais": "United States of America",
        "capital": "Washington",
        "latitud": 38.8950982,
        "longitud": -77.0363849,
        "poblacion": "672228",
        "wikidata": "Q61"
    },
    {
        "pais_codigo": "MK",
        "pais": "North Macedonia",
        "capital": "Скопје",
        "latitud": 41.9962164,
        "longitud": 21.4318935,
        "poblacion": "422540",
        "wikidata": "Q384"
    },
    {
        "pais_codigo": "PH",
        "pais": "Philippines",
        "capital": "Manila",
        "latitud": 14.5904492,
        "longitud": 120.9803621,
        "poblacion": "1780148",
        "wikidata": "Q1461"
    },
    {
        "pais_codigo": "OM",
        "pais": "Oman",
        "capital": "Mascate",
        "latitud": 23.6123628,
        "longitud": 58.5938134,
        "poblacion": "29923",
        "wikidata": "Q3826"
    },
    {
        "pais_codigo": "PG",
        "pais": "Papua New Guinea",
        "capital": "Port Moresby",
        "latitud": -9.4743301,
        "longitud": 147.1599504,
        "poblacion": "364145",
        "wikidata": "Q36526"
    },
    {
        "pais_codigo": "DE",
        "pais": "Germany",
        "capital": "Berlin",
        "latitud": 52.5173885,
        "longitud": 13.3951309,
        "poblacion": "3769962",
        "wikidata": "Q64"
    },
    {
        "pais_codigo": "MU",
        "pais": "Mauricio",
        "capital": "Port Louis",
        "latitud": -20.1624522,
        "longitud": 57.5028044,
        "poblacion": "147688",
        "wikidata": "Q3929"
    },
    {
        "pais_codigo": "EZ",
        "pais": "Swaziland",
        "capital": "Mbabane",
        "latitud": -26.325745,
        "longitud": 31.144663,
        "poblacion": "94874",
        "wikidata": "Q3904"
    },
    {
        "pais_codigo": "GD",
        "pais": "Grenada",
        "capital": "St. George's",
        "latitud": 12.0535331,
        "longitud": -61.751805,
        "poblacion": "3929",
        "wikidata": "Q41547"
    },
    {
        "pais_codigo": "VC",
        "pais": "Saint Vincent and the Grenadines",
        "capital": "Kingstown",
        "latitud": 13.1561864,
        "longitud": -61.2279621,
        "poblacion": "25720",
        "wikidata": "Q41474"
    },
    {
        "pais_codigo": "BB",
        "pais": "Barbados",
        "capital": "Bridgetown",
        "latitud": 13.0977832,
        "longitud": -59.6184184,
        "poblacion": "110000",
        "wikidata": "Q36168"
    },
    {
        "pais_codigo": "MR",
        "pais": "Mauritius",
        "capital": "Nuakchot",
        "latitud": 18.0792379,
        "longitud": -15.9780071,
        "poblacion": "958399",
        "wikidata": "Q3688"
    },
    {
        "pais_codigo": "GM",
        "pais": "Gambia",
        "capital": "Banjul",
        "latitud": 13.45535,
        "longitud": -16.575646,
        "poblacion": "31356",
        "wikidata": "Q3726"
    },
    {
        "pais_codigo": "PY",
        "pais": "Paraguay",
        "capital": "Assumption",
        "latitud": -25.2800459,
        "longitud": -57.6343814,
        "poblacion": "742023",
        "wikidata": "Q2933"
    },
    {
        "pais_codigo": "GW",
        "pais": "Guinea Bissau",
        "capital": "Bissau",
        "latitud": 11.861324,
        "longitud": -15.583055,
        "poblacion": "395954",
        "wikidata": "Q3739"
    },
    {
        "pais_codigo": "YE",
        "pais": "Yemen",
        "capital": "Fury",
        "latitud": 15.3538569,
        "longitud": 44.2058841,
        "poblacion": "1527861",
        "wikidata": "Q2471"
    },
    {
        "pais_codigo": "AE",
        "pais": "United Arab Emirates",
        "capital": "Abu Dhabi",
        "latitud": 24.4538352,
        "longitud": 54.3774014,
        "poblacion": "921000",
        "wikidata": "Q1519"
    },
    {
        "pais_codigo": "TL",
        "pais": "Democratic Republic of Timor-Leste",
        "capital": "Dili",
        "latitud": -8.5536809,
        "longitud": 125.5784093,
        "poblacion": "222323",
        "wikidata": "Q9310"
    },
    {
        "pais_codigo": "JP",
        "pais": "Japan",
        "capital": "Tokio",
        "latitud": 35.6768601,
        "longitud": 139.7638947,
        "poblacion": "13613660",
        "wikidata": "Q1490"
    },
    {
        "pais_codigo": "PT",
        "pais": "Portugal",
        "capital": "Lisbon",
        "latitud": 38.7077507,
        "longitud": -9.1365919,
        "poblacion": "552700",
        "wikidata": "Q597"
    },
    {
        "pais_codigo": "CK",
        "pais": "Islas Cook",
        "capital": "Avarua",
        "latitud": -21.2074736,
        "longitud": -159.7708145,
        "poblacion": "5445",
        "wikidata": "Q170482"
    },
    {
        "pais_codigo": "NL",
        "pais": "Netherlands",
        "capital": "Amsterdam",
        "latitud": 52.3730796,
        "longitud": 4.8924534,
        "poblacion": "881933",
        "wikidata": "Q727"
    },
    {
        "pais_codigo": "EG",
        "pais": "Egypt",
        "capital": "Cairo",
        "latitud": 30.0443879,
        "longitud": 31.2357257,
        "poblacion": "9120350",
        "wikidata": "Q85"
    },
    {
        "pais_codigo": "SM",
        "pais": "Saint Marino",
        "capital": "City of Saint Marino",
        "latitud": 43.9363996,
        "longitud": 12.4466991,
        "poblacion": "4211",
        "wikidata": "Q1848"
    },
    {
        "pais_codigo": null,
        "pais": "Sulawesi",
        "capital": "Paramaribo",
        "latitud": 5.8247628,
        "longitud": -55.1703941,
        "poblacion": "242946",
        "wikidata": "Q3001"
    },
    {
        "pais_codigo": "BZ",
        "pais": "Belize",
        "capital": "Belmopan",
        "latitud": 17.250199,
        "longitud": -88.770018,
        "poblacion": "20754",
        "wikidata": "Q3043"
    },
    {
        "pais_codigo": "ZW",
        "pais": "Zimbawe",
        "capital": "Harare",
        "latitud": -17.831773,
        "longitud": 31.045686,
        "poblacion": "1606000",
        "wikidata": "Q3921"
    },
    {
        "pais_codigo": "HT",
        "pais": "Haiti",
        "capital": "Port-au-Prince",
        "latitud": 18.547327,
        "longitud": -72.3395928,
        "poblacion": "1275000",
        "wikidata": "Q34261"
    },
    {
        "pais_codigo": "LB",
        "pais": "Liban",
        "capital": "Beirut",
        "latitud": 33.8959203,
        "longitud": 35.47843,
        "poblacion": "1252000",
        "wikidata": "Q3820"
    },
    {
        "pais_codigo": "GY",
        "pais": "Guyana",
        "capital": "Georgetown",
        "latitud": 6.8032561,
        "longitud": -58.1455403,
        "poblacion": "310320",
        "wikidata": "Q10717"
    },
    {
        "pais_codigo": "ST",
        "pais": "São Tomé and Principe",
        "capital": "São Tomé and Principe",
        "latitud": 0.3389242,
        "longitud": 6.7313031,
        "poblacion": "53300",
        "wikidata": "Q3932"
    },
    {
        "pais_codigo": "UY",
        "pais": "Uruguay",
        "capital": "Montevideo",
        "latitud": -34.9058916,
        "longitud": -56.1913095,
        "poblacion": "1302954",
        "wikidata": "Q1335"
    },
    {
        "pais_codigo": "MA",
        "pais": "Morocco",
        "capital": "Rabat",
        "latitud": 34.0218454,
        "longitud": -6.8408929,
        "poblacion": "1650000",
        "wikidata": "Q3551"
    },
    {
        "pais_codigo": "AR",
        "pais": "Argelia",
        "capital": "Algiers",
        "latitud": 36.7729333,
        "longitud": 3.0588445,
        "poblacion": "3415811",
        "wikidata": "Q3561"
    },
    {
        "pais_codigo": "BU",
        "pais": "Burundi",
        "capital": "Gitega",
        "latitud": -3.4284953,
        "longitud": 29.9249718,
        "poblacion": "155005",
        "wikidata": "Q167551"
    },
    {
        "pais_codigo": "BO",
        "pais": "Bolivia",
        "capital": "Sucre",
        "latitud": -19.0477251,
        "longitud": -65.2594306,
        "poblacion": "238798",
        "wikidata": "Q2907"
    },
    {
        "pais_codigo": "DO",
        "pais": "Dominican Republic",
        "capital": "Santo Domingo",
        "latitud": 18.4713858,
        "longitud": -69.8918436,
        "poblacion": "965040",
        "wikidata": "Q34820"
    },
    {
        "pais_codigo": "SA",
        "pais": "Saudi Arabia",
        "capital": "Riyadh",
        "latitud": 24.638916,
        "longitud": 46.7160104,
        "poblacion": "5188286",
        "wikidata": "Q3692"
    },
    {
        "pais_codigo": "MM",
        "pais": "Myanmar",
        "capital": "နေပြည်တော်",
        "latitud": 19.7753289,
        "longitud": 96.1032552,
        "poblacion": "1160242",
        "wikidata": "Q37400"
    },
    {
        "pais_codigo": "PK",
        "pais": "Pakistan",
        "capital": "Islamabad",
        "latitud": 33.6938118,
        "longitud": 73.0651511,
        "poblacion": "1009832",
        "wikidata": "Q1362"
    },
    {
        "pais_codigo": "CI",
        "pais": "Ivory Coast",
        "capital": "Yamoussoukro",
        "latitud": 6.8200066,
        "longitud": -5.2776034,
        "poblacion": "340234",
        "wikidata": "Q3768"
    },
    {
        "pais_codigo": "CM",
        "pais": "Cameroon",
        "capital": "Yaoundé",
        "latitud": 3.8689867,
        "longitud": 11.5213344,
        "poblacion": "1817524",
        "wikidata": "Q3808"
    },
    {
        "pais_codigo": "KM",
        "pais": "Comoras",
        "capital": "Moroni",
        "latitud": -11.7040306,
        "longitud": 43.251909,
        "poblacion": "111329",
        "wikidata": "Q3901"
    },
    {
        "pais_codigo": "MH",
        "pais": "Isles Marshall",
        "capital": "Mājro",
        "latitud": 7.0909924,
        "longitud": 171.3816354,
        "poblacion": "26000",
        "wikidata": "Q12919"
    },
    {
        "pais_codigo": "WS",
        "pais": "Samoa",
        "capital": "Apia",
        "latitud": -13.8345235,
        "longitud": -171.7630955,
        "poblacion": "37708",
        "wikidata": "Q36260"
    },
    {
        "pais_codigo": "PL",
        "pais": "Poland",
        "capital": "Warsaw",
        "latitud": 52.2319581,
        "longitud": 21.0067249,
        "poblacion": "1863845",
        "wikidata": "Q270"
    },
    {
        "pais_codigo": "CG",
        "pais": "Congo",
        "capital": "Brazzaville",
        "latitud": -4.2694407,
        "longitud": 15.2712256,
        "poblacion": "1932610",
        "wikidata": "Q3844"
    },
    {
        "pais_codigo": "NU",
        "pais": "Niue",
        "capital": "Alofi",
        "latitud": -19.0534159,
        "longitud": -169.919199,
        "poblacion": null,
        "wikidata": "Q30966"
    },
    {
        "pais_codigo": "GT",
        "pais": "Guatemala",
        "capital": "Guatemala City",
        "latitud": 14.6416142,
        "longitud": -90.5132836,
        "poblacion": "2450212",
        "wikidata": "Q1555"
    },
    {
        "pais_codigo": "SK",
        "pais": "Slovakia",
        "capital": "Bratislava",
        "latitud": 48.1516988,
        "longitud": 17.1093063,
        "poblacion": "432801",
        "wikidata": "Q1780"
    },
    {
        "pais_codigo": "SK",
        "pais": "Singapore",
        "capital": "Singapore",
        "latitud": 1.2899175,
        "longitud": 103.8519072,
        "poblacion": "5535002",
        "wikidata": "Q334"
    },
    {
        "pais_codigo": "KW",
        "pais": "Kuwait",
        "capital": "Kuwait",
        "latitud": 29.3796532,
        "longitud": 47.9734174,
        "poblacion": "637411",
        "wikidata": "Q35178"
    },
    {
        "pais_codigo": "KH",
        "pais": "Camboya",
        "capital": "Nom Pen",
        "latitud": 11.568271,
        "longitud": 104.9224426,
        "poblacion": "2009264",
        "wikidata": "Q1850"
    },
    {
        "pais_codigo": "CO",
        "pais": "Colombia",
        "capital": "Bogotá",
        "latitud": 4.6533817,
        "longitud": -74.0836331,
        "poblacion": "8181047",
        "wikidata": "Q2841"
    },
    {
        "pais_codigo": "KI",
        "pais": "Kiribati",
        "capital": "South Tarawa",
        "latitud": 1.3490778,
        "longitud": 173.0386512,
        "poblacion": "63439",
        "wikidata": "Q131233"
    },
    {
        "pais_codigo": "FM",
        "pais": "Micronesia",
        "capital": "Palikir",
        "latitud": 6.920744,
        "longitud": 158.1627143,
        "poblacion": null,
        "wikidata": "Q42751"
    },
    {
        "pais_codigo": "UG",
        "pais": "Uganda",
        "capital": "Kampala",
        "latitud": 0.3177137,
        "longitud": 32.5813539,
        "poblacion": "1516210",
        "wikidata": "Q3894"
    },
    {
        "pais_codigo": "SB",
        "pais": "Islas Solomon",
        "capital": "Honiara",
        "latitud": -9.4310769,
        "longitud": 159.9552552,
        "poblacion": "129569",
        "wikidata": "Q40921"
    },
    {
        "pais_codigo": "VE",
        "pais": "Venezuela",
        "capital": "Caracas",
        "latitud": 10.5060934,
        "longitud": -66.9146008,
        "poblacion": "3523959",
        "wikidata": "Q1533"
    },
    {
        "pais_codigo": "GL",
        "pais": "Greenland",
        "capital": "Nuuk",
        "latitud": 64.1767049,
        "longitud": -51.7361444,
        "poblacion": "18326",
        "wikidata": "Q226"
    },
    {
        "pais_codigo": "TO",
        "pais": "Tonga",
        "capital": "Nukuʻalofa",
        "latitud": -21.1343401,
        "longitud": -175.201808,
        "poblacion": "24500",
        "wikidata": "Q38834"
    },
    {
        "pais_codigo": "SY",
        "pais": "Syria",
        "capital": "Damascus",
        "latitud": 33.5130695,
        "longitud": 36.3095814,
        "poblacion": "1414913",
        "wikidata": "Q3766"
    },
    {
        "pais_codigo": "TW",
        "pais": "中華民國",
        "capital": "臺北市",
        "latitud": 25.0375198,
        "longitud": 121.5636796,
        "poblacion": "2695704",
        "wikidata": "Q1867"
    },
    {
        "pais_codigo": "PA",
        "pais": "Panama",
        "capital": "Panamá",
        "latitud": 8.9714493,
        "longitud": -79.5341802,
        "poblacion": "1086990",
        "wikidata": "Q3306"
    },
    {
        "pais_codigo": "FI",
        "pais": "Finlandia",
        "capital": "Helsinki",
        "latitud": 60.1666204,
        "longitud": 24.9435408,
        "poblacion": "695526",
        "wikidata": "Q1757"
    },
    {
        "pais_codigo": "BT",
        "pais": "Butan",
        "capital": "Thimphu",
        "latitud": 27.4713546,
        "longitud": 89.6336729,
        "poblacion": "98676",
        "wikidata": "Q9270"
    },
    {
        "pais_codigo": "MT",
        "pais": "Malta",
        "capital": "Valletta",
        "latitud": 35.8989979,
        "longitud": 14.5136607,
        "poblacion": "5721",
        "wikidata": "Q23800"
    },
    {
        "pais_codigo": "HR",
        "pais": "Croatia",
        "capital": "Zagreb",
        "latitud": 45.8130967,
        "longitud": 15.9772795,
        "poblacion": "663592",
        "wikidata": "Q1435"
    },
    {
        "pais_codigo": "CZ",
        "pais": "Czechia",
        "capital": "Prague",
        "latitud": 50.0874654,
        "longitud": 14.4212535,
        "poblacion": "1275406",
        "wikidata": "Q1085"
    },
    {
        "pais_codigo": "GE",
        "pais": "Georgia",
        "capital": "Tbilisi",
        "latitud": 41.6934591,
        "longitud": 44.8014495,
        "poblacion": "1282574",
        "wikidata": "Q994"
    },
    {
        "pais_codigo": "TH",
        "pais": "Thailand",
        "capital": "Bangkok",
        "latitud": 13.7524938,
        "longitud": 100.4935089,
        "poblacion": "5666264",
        "wikidata": "Q1861"
    },
    {
        "pais_codigo": "BE",
        "pais": "Belgium",
        "capital": "Brussels",
        "latitud": 50.8467372,
        "longitud": 4.352493,
        "poblacion": "194291",
        "wikidata": "Q239"
    },
    {
        "pais_codigo": "JO",
        "pais": "Jordania",
        "capital": "Aman",
        "latitud": 31.9515694,
        "longitud": 35.9239625,
        "poblacion": "4000000",
        "wikidata": "Q3805"
    },
    {
        "pais_codigo": "BJ",
        "pais": "Benin",
        "capital": "Porto-Novo",
        "latitud": 6.4990718,
        "longitud": 2.6253361,
        "poblacion": "265500",
        "wikidata": "Q3799"
    },
    {
        "pais_codigo": "QA",
        "pais": "Catar",
        "capital": "Doha",
        "latitud": 25.2856329,
        "longitud": 51.5264162,
        "poblacion": "1312947",
        "wikidata": "Q3861"
    },
    {
        "pais_codigo": "RU",
        "pais": "Russia",
        "capital": "Moscow",
        "latitud": 55.7505412,
        "longitud": 37.6174782,
        "poblacion": "13274285",
        "wikidata": "Q649"
    },
    {
        "pais_codigo": "BN",
        "pais": "Brunei",
        "capital": "Bandar Seri Begawan",
        "latitud": 4.8895453,
        "longitud": 114.9417574,
        "poblacion": "50000",
        "wikidata": "Q9279"
    },
    {
        "pais_codigo": "LY",
        "pais": "Libia",
        "capital": "Tripoli",
        "latitud": 32.896672,
        "longitud": 13.1777923,
        "poblacion": "2127000",
        "wikidata": "Q3579"
    },
    {
        "pais_codigo": "BG",
        "pais": "Bulgaria",
        "capital": "София",
        "latitud": 42.6977028,
        "longitud": 23.3217359,
        "poblacion": "1286383",
        "wikidata": "Q472"
    },
    {
        "pais_codigo": "MC",
        "pais": "Monaco",
        "capital": "Monaco",
        "latitud": 43.7310164,
        "longitud": 7.4209592,
        "poblacion": "39050",
        "wikidata": "Q235"
    },
    {
        "pais_codigo": "AL",
        "pais": "Albania",
        "capital": "Tiranë",
        "latitud": 41.3281482,
        "longitud": 19.8184435,
        "poblacion": "557422",
        "wikidata": "Q19689"
    },
    {
        "pais_codigo": "MY",
        "pais": "Malaysia",
        "capital": "Kuala Lumpur",
        "latitud": 3.1516964,
        "longitud": 101.6942371,
        "poblacion": "1982112",
        "wikidata": "Q1865"
    },
    {
        "pais_codigo": "CY",
        "pais": "Cyiprus",
        "capital": "Λευκωσία - Lefkoşa",
        "latitud": 35.1746503,
        "longitud": 33.3638783,
        "poblacion": "310355",
        "wikidata": "Q3856"
    },
    {
        "pais_codigo": "KP",
        "pais": "South Korea",
        "capital": "서울특별시",
        "latitud": 37.5666791,
        "longitud": 126.9782914,
        "poblacion": "9635445",
        "wikidata": "Q8684"
    },
    {
        "pais_codigo": "LI",
        "pais": "Liechteinstein",
        "capital": "Vaduz",
        "latitud": 47.1392862,
        "longitud": 9.5227962,
        "poblacion": "5229",
        "wikidata": "Q1844"
    },
    {
        "pais_codigo": "BA",
        "pais": "Bosnia and Herzegovina",
        "capital": "Sarajevo",
        "latitud": 43.8570713,
        "longitud": 18.4126147,
        "poblacion": "271194",
        "wikidata": "Q11194"
    },
    {
        "pais_codigo": "IS",
        "pais": "Iceland",
        "capital": "Reykjavík",
        "latitud": 64.145981,
        "longitud": -21.9422367,
        "poblacion": "139804",
        "wikidata": "Q1764"
    },
    {
        "pais_codigo": "AZ",
        "pais": "Azerbaiyan",
        "capital": "Baku",
        "latitud": 40.3755885,
        "longitud": 49.8328009,
        "poblacion": "2300500",
        "wikidata": "Q9248"
    },
    {
        "pais_codigo": "TG",
        "pais": "Togo",
        "capital": "Lomé",
        "latitud": 6.130419,
        "longitud": 1.215829,
        "poblacion": "837437",
        "wikidata": "Q3792"
    },
    {
        "pais_codigo": "IM",
        "pais": "Isla de Man",
        "capital": "Douglas",
        "latitud": 54.149774,
        "longitud": -4.4779021,
        "poblacion": "27938",
        "wikidata": "Q18569"
    },
    {
        "pais_codigo": "FJ",
        "pais": "Fiji",
        "capital": "Suva",
        "latitud": -18.1415884,
        "longitud": 178.4421662,
        "poblacion": "100000",
        "wikidata": "Q38807"
    },
    {
        "pais_codigo": "TT",
        "pais": "Trinidad and Tobago tobago",
        "capital": "Port of Spain",
        "latitud": 10.6572678,
        "longitud": -61.5180173,
        "poblacion": "37074",
        "wikidata": "Q39178"
    },
    {
        "pais_codigo": "PS",
        "pais": "Pristina",
        "capital": "Prishtinë",
        "latitud": 42.6638771,
        "longitud": 21.1640849,
        "poblacion": "161751",
        "wikidata": "Q25270"
    },
    {
        "pais_codigo": "GQ",
        "pais": "Equatorial Guinea",
        "capital": "City of Peace",
        "latitud": 1.5994535,
        "longitud": 10.8268276,
        "poblacion": null,
        "wikidata": "Q1140136"
    },
    {
        "pais_codigo": "TV",
        "pais": "Tuvalu",
        "capital": "Funafuti",
        "latitud": -8.5199633,
        "longitud": 179.1982548,
        "poblacion": null,
        "wikidata": "Q34126"
    },
    {
        "pais_codigo": "MV",
        "pais": "Maldives",
        "capital": "މާލެ",
        "latitud": 4.1779879,
        "longitud": 73.5107387,
        "poblacion": "103693",
        "wikidata": "Q9347"
    },
    {
        "pais_codigo": "BD",
        "pais": "Bangladesh",
        "capital": "ঢাকা",
        "latitud": 23.7643863,
        "longitud": 90.3890144,
        "poblacion": "21741000",
        "wikidata": "Q1354"
    },
    {
        "pais_codigo": "IE",
        "pais": "Irlanda",
        "capital": "Dublin",
        "latitud": 53.3493795,
        "longitud": -6.2605593,
        "poblacion": "554554",
        "wikidata": "Q1761"
    },
    {
        "pais_codigo": "PW",
        "pais": "Palau",
        "capital": "Ngerulmud",
        "latitud": 7.5006446,
        "longitud": 134.6242864,
        "poblacion": "391",
        "wikidata": "Q515229"
    },
    {
        "pais_codigo": "PE",
        "pais": "Peru",
        "capital": "Lime",
        "latitud": -12.0459808,
        "longitud": -77.0305912,
        "poblacion": "9989369",
        "wikidata": "Q2868"
    },
    {
        "pais_codigo": "LC",
        "pais": "Saint Lucia",
        "capital": "Castries",
        "latitud": 14.0095966,
        "longitud": -60.9902359,
        "poblacion": "22000",
        "wikidata": "Q41699"
    },
    {
        "pais_codigo": "DM",
        "pais": "Dominica",
        "capital": "Roseau",
        "latitud": 15.2991923,
        "longitud": -61.3872868,
        "poblacion": "15000",
        "wikidata": "Q36281"
    },
    {
        "pais_codigo": "ER",
        "pais": "Eritrea",
        "capital": "ኣስመራ Asmara أسمرة",
        "latitud": 15.3389667,
        "longitud": 38.9326763,
        "poblacion": "579000",
        "wikidata": "Q3642"
    },
    {
        "pais_codigo": "MW",
        "pais": "Malawi",
        "capital": "Lilongwe",
        "latitud": -13.9875107,
        "longitud": 33.768144,
        "poblacion": "781538",
        "wikidata": "Q3876"
    },
    {
        "pais_codigo": "NI",
        "pais": "Nicaragua",
        "capital": "Managua",
        "latitud": 12.1547116,
        "longitud": -86.273725,
        "poblacion": "1030926",
        "wikidata": "Q3274"
    },
    {
        "pais_codigo": "SV",
        "pais": "Saint Salvador",
        "capital": "Saint Salvador",
        "latitud": 13.697629,
        "longitud": -89.191156,
        "poblacion": "316090",
        "wikidata": "Q3110"
    },
    {
        "pais_codigo": "HN",
        "pais": "Honduras",
        "capital": "Tegucigalpa",
        "latitud": 14.1058135,
        "longitud": -87.2047053,
        "poblacion": "1120000",
        "wikidata": "Q609188"
    },
    {
        "pais_codigo": "MX",
        "pais": "Costa Rica",
        "capital": "Saint Joseph",
        "latitud": 9.9327707,
        "longitud": -84.0796144,
        "poblacion": "342188",
        "wikidata": "Q800"
    },
    {
        "pais_codigo": "BR",
        "pais": "Brazil",
        "capital": "Brasilia",
        "latitud": -15.721487,
        "longitud": -48.1021719,
        "poblacion": "218188",
        "wikidata": "Q155"
    }    
];
