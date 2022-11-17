const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const intialiseDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`Error Message is : ${e}`);
  }
};
intialiseDBAndServer();

//API 1
//Returns a list of all states in the state table
const convertStateDbObjectAPI1 = (objectItem) => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  };
};

app.get("/states/", async (request, response) => {
  const getStateQuery = `SELECT * FROM state;`;
  const getStateQueryResponse = await db.all(getStateQuery);
  response.send(
    getStateQueryResponse.map((eachObject) =>
      convertStateDbObjectAPI1(eachObject)
    )
  );
});

//API 2
//Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateListQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const getStateQueryResponse = await db.get(getStateListQuery);
  response.send(convertStateDbObjectAPI1(getStateQueryResponse));
});

//API 3
//Create a district in the district table, district_id is auto-incremented

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const createDistrictQuery = `insert into district(district_name,state_id,cases,cured,active,deaths)
    values('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const createDistrictQueryResponse = await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

//API 4
//Returns a district based on the district ID
const convertDistDbObjectAPI4 = (objectItem) => {
  return {
    districtId: objectItem.district_id,
    districtName: objectItem.district_name,
    stateId: objectItem.state_id,
    cases: objectItem.cases,
    cured: objectItem.cured,
    active: objectItem.active,
    deaths: objectItem.deaths,
  };
};
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const getDistQueryResponse = await db.get(getDistQuery);
  response.send(convertDistDbObjectAPI4(getDistQueryResponse));
});

//API5
//Deletes a district from the district table based on the district ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  const deleteDistQueryResponse = await db.run(deleteDistQuery);
  response.send("District Removed");
});

//api6
//Updates the details of a specific district based on the district ID
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `update district set
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths} where district_id = ${districtId};`;

  const updateDistrictQueryResponse = await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
//Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesByStatsQuery = `SELECT sum(cases) as totalCases, sum(cured) as totalCured,sum(active) as totalActive, sum(deaths) as totalDeaths from district where state_id = ${stateId};`;
  const getStateByStatsQueryResponse = await db.get(getStatesByStatsQuery);
  response.send(getStateByStatsQueryResponse);
});

//API 8
//Returns an object containing the state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `select state_id from district where district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  //console.log(typeof getDistrictIdQueryResponse.state_id);
  const getStateNameQuery = `select state_name as stateName from state where 
  state_id = ${getDistrictIdQueryResponse.state_id}`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
