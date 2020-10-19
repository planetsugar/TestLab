import React from 'react';
import logo from './logo.svg';
import logo_explode from './logo_explode.svg';
import logo_disarmed from './logo_disarmed.svg';
import './App.css';
import { __BUTTON_TIMER_IN_SECONDS__, __RANDOM_NUMBER_URL__, __MIN_MAX_NUMBERS__ } from './Constants';
import * as text from './Text'

type WireType = 'RED' | 'GREEN';

let bombTimer: NodeJS.Timeout; 
let wireToCut: WireType;

const fetchRandomNumber = async (min: number, max: number) => {

    const randomUrl = `${__RANDOM_NUMBER_URL__}${__MIN_MAX_NUMBERS__}`;
    
    return await fetch(randomUrl)
      .then(response => {           
          return response.text().then(data => 
            {                    
              return data 
            });
        }
      );        
}

function App() {

  const [bombDisarmed, setBombDisarm] = React.useState(false);
  const [hasExploded, setExplosionStatus] = React.useState(false);
  const [fetchingRandoms, setFetchingRandoms] = React.useState(true);
  const [goCount, setGoCount] = React.useState(0);

  const cutWire = React.useCallback((wire: WireType) => {
    setExplosionStatus(wire !== wireToCut);
    setBombDisarm(true);
    clearTimeout(bombTimer);
  }, []);

  React.useEffect(() => { 
    fetchRandomNumber(0,1).then(wire => {       
      wireToCut = wire.trim() === "0" ? 'RED' : 'GREEN';
      setFetchingRandoms(false); 
      bombTimer = setTimeout(() => setExplosionStatus(true),__BUTTON_TIMER_IN_SECONDS__ * 1000);      
    });
  }, [goCount]);

  return (
    <div className="App">
      <header className="App-header">
        { fetchingRandoms && <React.Fragment>
            <p data-testid="fetching-randoms">{ text.default.FETCHING_RANDOMS }</p>
          </React.Fragment>
        }
        { !fetchingRandoms && <React.Fragment>
          <img src={
            !bombDisarmed && !hasExploded ? logo :
            bombDisarmed && !hasExploded ? logo_disarmed :
            logo_explode
          } className="App-logo" alt="logo" data-testid="react-logo" />
            { !hasExploded && 
              <div data-testid="unexploded-section">
                  <p data-testid="cutwire-text">
                    {bombDisarmed ? text.default.YOU_HAVE_DISARMED_THE_BOMB : text.default.CUT_WIRE}
                  </p>
                  <p>
                    <button data-testid="red-button" name='Red' disabled={bombDisarmed} onClick=
                    { () => cutWire('RED') } >
                      {text.default.REDWIRE}
                    </button>&nbsp;
                    <button data-testid="green-button" name='Green' disabled={bombDisarmed} onClick=
                    { () => cutWire('GREEN') }>
                      {text.default.GREENWIRE}
                    </button>
                  </p>
              </div> 
            }
            { hasExploded && 
              <div data-testid="exploded-section">
                  <p data-testid="dead-section">
                    {text.default.YOU_ARE_DEAD}
                  </p>
                  <p data-testid="disclaimer-section">
                    {text.default.DISCLAIMER} 
                  </p>                 
              </div> 
            }
            { (hasExploded || bombDisarmed) && 
              <div>
                 <button data-testid="try-again-button" name='Again' onClick={ 
                    () => { 
                      setBombDisarm(false);
                      setExplosionStatus(false);
                      setFetchingRandoms(true);
                      setGoCount(goCount + 1);
                    } 
                  }>
                      { text.default.AGAIN }
                  </button>
              </div>
            }
          </React.Fragment>
        }
      </header>
    </div>
  );
}

export default App;
