import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import axios from 'axios';
import { Button, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';

import CanvasJSReact from "./canvasjs.react";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

interface AppProps {
}


const App: React.FC<AppProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [trace, setTrace] = useState<any>();
  const [data, setData] = useState<any>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [query, setQuery] = useState("");
  const [xMinLimit, setXMinLimit] = useState<number>(1516);
  const [xMaxLimit, setXMaxLimit] = useState<number>(1579);
  const [queriesHistory, setQueriesHistory] = useState<any>([] as any[]);
  const [instrumentResponse, setInstrumentResponse] = useState("Instrument Response");
  const [refreshRate, setRefreshRate] = useState(1);

  useEffect(() => {
    
    axios.get("http://127.0.0.1:5000/trace")
      .then((res) => {
        res.data.xdata.reverse()
        res.data.ydata.reverse()
        setTrace(res.data);
        axios.get("http://127.0.0.1:5000/lim").then((response) => {
          const limits = response.data.replace("+READY>[", "").replace("]", "").split(",");
          setXMaxLimit(parseInt(limits[1]))
          setXMinLimit(parseInt(limits[0]))
          setLoading(false)
        })
        
      })
  }, [setTrace])

  useEffect(() => {
    const timer = setTimeout(() => {
      if(!loading) {
        if (trace.xdata.length === 0) {
          setIsRunning(false);
          return;
        }
        return isRunning && setData([...data, {x: trace.xdata.pop(), y: trace.ydata.pop()}])}
      }
      , 1000/(refreshRate))
    return () => clearTimeout(timer)
   })

   const options = !loading ?  {
    title: {
      text: "Cloud Optical Spectrum Analyzer Challenge"
    },
    height: 600,
    axisY:{
      title: trace.ylabel + " (" + trace.yunits + ")",

     },
    axisX:{
      title: trace.xlabel + " (" + trace.xunits + ")",
     },
    zoomEnabled: true,
    data: [{				
              type: "line",
              dataPoints: data
     }]
 } : {}

 const resetGraph = () => {
   setLoading(true)
   setData([])
   axios.get("http://127.0.0.1:5000/trace")
      .then((res) => {
        res.data.xdata.reverse()
        res.data.ydata.reverse()
        setTrace(res.data);
        setInstrumentResponse("TRACE FETCHED")
        setQueriesHistory([...queriesHistory, {req: "STATE", response: "TRACE FETCHED", time: new Date()}])
        setLoading(false)
      })
 }

 const displayTrace = () => {
   const tempData = [];
   while (data.length !== 0) {
    tempData.push(data.pop());
  } 
    while (trace.xdata.length !== 0) {
      tempData.push({x: trace.xdata.pop(), y: trace.ydata.pop()})
    }
    
    setData(tempData)
   }

 const getState = () => {
  axios.get("http://127.0.0.1:5000/state")
  .then((res) => {
    setInstrumentResponse(res.data)
    setQueriesHistory([...queriesHistory, {req: "STATE", response: res.data, time: new Date()}])
  })
 }

 const single = () => {
  axios.get("http://127.0.0.1:5000/single")
  .then((res) => {
    setInstrumentResponse(res.data)
    setQueriesHistory([...queriesHistory, {req: "SINGLE", response: res.data, time: new Date()}])
  })
 }

 const setLimits = (min: any, max: any) => {
  axios.get(`http://127.0.0.1:5000/setlim/${min}/${max}`).then((res) => {
    setInstrumentResponse(res.data)
    setQueriesHistory([...queriesHistory, {req: `/LIM/[${min},${max}]`, response: res.data, time: new Date()}])
  });

 }


  return (
    <>
    {!loading &&
      <Row className="mx-2">
        <Col md={10}>
          <CanvasJSChart options={options} />
          <p>Instrument model: {trace.instrument_model}</p>
          <p>Instrument object: {trace.instrument_object}</p>
          <h2>Made by Sébastien Coll</h2>
        </Col>
        <Col md={2}>
          <Row className="my-2">
            <Button className="w-100" onClick={() => {
              if(isRunning) {
                axios.get("http://127.0.0.1:5000/stop").then((res) => {
                  setInstrumentResponse(res.data)
                  setQueriesHistory([...queriesHistory, {req: "STOP", response: res.data, time: new Date()}])
                  setIsRunning(false);
                });
                
              } else {
                axios.get("http://127.0.0.1:5000/start").then((res) => {
                  setInstrumentResponse(res.data)
                  setQueriesHistory([...queriesHistory, {req: "START", response: res.data, time: new Date()}]);
                  setIsRunning(true);
                });
                
              }
              }}> {!isRunning ? "Start" : "Stop"} </Button>
          </Row>
          <Row className="my-2">
            <Form.Group className="">
              <InputGroup> 
                <InputGroup.Prepend>
                  <InputGroup.Text>Refresh rate (Hz)</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="number" onChange={(evt: any) => setRefreshRate(evt.target.value)} placeholder="Refresh rate" defaultValue={refreshRate}/>
              </InputGroup>
            </Form.Group>
          </Row>
          <Row className="my-2">
            <Button disabled={isRunning} className="w-100" onClick={() => {resetGraph()}}> Reset and get new trace </Button>
          </Row>
          <Row className="my-2">
            <Button disabled={isRunning} className="w-100" onClick={() => {displayTrace()}}> Display entire trace </Button>
          </Row>
          <Row className="my-2">
            <Button disabled={isRunning} className="w-100" onClick={() => {single()}}> SINGLE (can take a few seconds) </Button>
          </Row>
          <Row className="mt-4">
            <h2 className="">Queries</h2>
          </Row>
          <Row className="my-2">
            <Col>
              <Form.Group className="">
                <Form.Control onChange={(evt: any) => setQuery(evt.target.value)} placeholder="Enter a query" defaultValue={query} />
              </Form.Group>
            </Col>
            <Col>
              <Button onClick={() => {
                axios.get(`http://127.0.0.1:5000/echo/${query}`).then((res) => {
                  setInstrumentResponse(res.data)
                  setQueriesHistory([...queriesHistory, {req: query, response: res.data, time: new Date()}])
                })
              }} className="ml-auto w-100 h-75" disabled={isRunning}> Send </Button>
            </Col>
          </Row>
          <Row>
            <Button className="mb-4 ml-auto w-100 h-75" onClick={() => getState()} disabled={isRunning}>Get instrument state</Button>
          </Row>
          <Row>
            <Col>
              <h6>Minimum</h6>
              <Form.Control type="number" onChange={(evt: any) => setXMinLimit(evt.target.value)} min={1516} max={1579} placeholder="Enter a minimum" defaultValue={xMinLimit} />
            </Col>
            <Col>
              <h6>Maximum</h6>
              <Form.Control type="number" onChange={(evt: any) => setXMaxLimit(evt.target.value)} min={1516} max={1579} placeholder="Enter a maximum" defaultValue={xMaxLimit} />
            </Col>
          </Row>
          <Row>
              <Button disabled={isRunning} className="my-4 w-100" onClick={() => {setLimits(xMinLimit,xMaxLimit)}}> Update x-axis limits and get new trace. </Button>
          </Row>
          <Row>
            <Form.Control  type="text" placeholder={instrumentResponse.replace("+READY>", "")} readOnly />
          </Row>
          <Row className="my-5">
            <h5>Communication log</h5>
            <div style={{maxHeight: "400px", overflow:"auto"}}>
              <Table  striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Request</th>
                  <th>Response</th>
                  <th>Executed at</th>
                </tr>
              </thead>
              <tbody>
                {queriesHistory.map((q:any, i:number) => {
                  return (
                    <tr>
                      <td>{i}</td>
                      <td>{q.req.replace("+READY>", "")}</td>
                      <td>{q.response.replace("+READY>", "")}</td>
                      <td>{q.time.toLocaleTimeString()}</td>
                    </tr>
                  )
                })}
              </tbody>
              </Table>
            </div>
              
          </Row>
        </Col>
      </Row>
      }
      
    </>
  );
}

export default App;
