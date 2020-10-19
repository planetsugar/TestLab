import React from 'react';
import App, { WireType } from './App';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';
import { __RANDOM_NUMBER_URL__, __MIN_MAX_NUMBERS__ } from './Constants';
import * as text from './Text';

configure({ adapter: new Adapter() });

const flushPromises = () => new Promise(setImmediate);

describe('Application initialises correctly', () => {
  let appWrapper: any;

  beforeAll(() => { 
    appWrapper = mount(
      <React.Fragment>
        <App />
      </React.Fragment>
    )
  }) ;

  it('Will display the fetching random message', () => {
      expect(appWrapper.find('p[data-testid="fetching-randoms"]').text()).toBe(text.default.FETCHING_RANDOMS);
  });

  it('Will not display any of the bomb sections', () => {
    expect(appWrapper.exists('img[data-testid="react-logo"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="unexploded-section"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(false);
  });
});

describe('Application will fetch initial random information', () => {  
  beforeAll(() => { 
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {}));
    mount(
      <React.Fragment>
        <App />
      </React.Fragment>
    )    
  }) ;

  afterEach(() => { 
    (global.fetch as any).mockClear();
  });

  it('Will make a call to the random number service with the correct information', () => {    
    expect(global.fetch).toHaveBeenCalledTimes(1); 
    expect(global.fetch).toBeCalledWith(`${__RANDOM_NUMBER_URL__}${__MIN_MAX_NUMBERS__}`);                 
  });
});

describe('Present user with options to cut wire', () => {
  let appWrapper: any;

  beforeAll(async () => {
    await act(async () => { jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {       
      resolve({text: () => new Promise<any>((resolve, reject) => resolve("0"))}); 
    }));       
    appWrapper = mount(
      <React.Fragment>
        <App />
      </React.Fragment>
    );    
    await flushPromises();  
    });    
    appWrapper.update();
  });
  
  afterAll(() => { 
    (global.fetch as any).mockClear();
  });

  it('Will not display fetching message or the unexploded section', () => {
    expect(appWrapper.exists('p[data-testid="fetching-randoms"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(false);
  });

  it('Will show the bomb section correctly', () => {    
    expect(appWrapper.exists('img[data-testid="react-logo"]')).toBe(true);  
    expect(appWrapper.exists('div[data-testid="unexploded-section"]')).toBe(true);
    
    // Check text
    expect(appWrapper.find('p[data-testid="cutwire-text"]').text()).toBe(text.default.CUT_WIRE);
    expect(appWrapper.find('button[data-testid="red-button"]').text()).toBe(text.default.REDWIRE);
    expect(appWrapper.find('button[data-testid="green-button"]').text()).toBe(text.default.GREENWIRE);

    // Buttons are enabled
    expect(appWrapper.find('button[data-testid="red-button"]').props().disabled).toBe(false);
    expect(appWrapper.find('button[data-testid="green-button"]').props().disabled).toBe(false);    
  });
});

describe('When the bomb explodes when timer runs out', () => {
  let appWrapper: any;

  beforeAll(async () => {
    jest.useFakeTimers();
    await act(async () => { jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {       
      resolve({text: () => new Promise<any>((resolve, reject) => resolve("0"))}); 
    }));       
    appWrapper = mount(
      <React.Fragment>
        <App />
      </React.Fragment>
    );        
    await flushPromises();    
    });
    await act(async () => { await jest.runOnlyPendingTimers() });      
    appWrapper.update();  
  });
  
  afterAll(() => { 
    (global.fetch as any).mockClear();
  });

  it('Will not display fetching message or the unexploded section', () => {    
    expect(appWrapper.exists('p[data-testid="fetching-randoms"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="unexploded-section"]')).toBe(false);
  });

  it('Will show the bomb has exploded correctly', () => {    
    expect(appWrapper.exists('img[data-testid="react-logo"]')).toBe(true);  
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(true);
    
    // Check text
    expect(appWrapper.find('p[data-testid="dead-section"]').text()).toBe(text.default.YOU_ARE_DEAD);
    expect(appWrapper.find('p[data-testid="disclaimer-section"]').text()).toBe(text.default.DISCLAIMER);
    expect(appWrapper.find('button[data-testid="try-again-button"]').text()).toBe(text.default.AGAIN);    
  });

  // **********
  it('will allow the user to try again', async () => {        

    // We want to fetch again
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {}));

    // Find the button and press it
    const tryAgain = appWrapper.find('button[data-testid="try-again-button"]');  
    await act(async () => await tryAgain.simulate('click'));    
    appWrapper.update();

    // Check that it is in a fetching state
    expect(appWrapper.find('p[data-testid="fetching-randoms"]').text()).toBe(text.default.FETCHING_RANDOMS);
  });

});

describe('When the user correctly defuses the bomb', () => {
  let appWrapper: any;
  
  const selectWire = async (wire: WireType) => {    
    await act(async () => { jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {       
      resolve({text: () => new Promise<any>((resolve, reject) => resolve(wire === 'RED' ? "0" : "1"))}); 
    }));       
    appWrapper = mount(
      <React.Fragment>
        <App />
      </React.Fragment>
    );    
    await flushPromises();  
    });    
    appWrapper.update();
  }
  
  afterAll(() => { 
    (global.fetch as any).mockClear();
  });

  it('will show a success message when the red wire is correctly cut', async () => {
    await selectWire('RED');

    // Find the red button and press it
    let redButton = appWrapper.find('button[data-testid="red-button"]');  
    let greenButton = appWrapper.find('button[data-testid="green-button"]');  

    await act(async () => await redButton.simulate('click'));    
    appWrapper.update();

    expect(appWrapper.exists('p[data-testid="fetching-randoms"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(false);
    expect(appWrapper.find('p[data-testid="cutwire-text"]').text()).toBe(text.default.YOU_HAVE_DISARMED_THE_BOMB);

    // Buttons should be disabled, need to refetch the components

    redButton = appWrapper.find('button[data-testid="red-button"]');  
    greenButton = appWrapper.find('button[data-testid="green-button"]');  

    expect(redButton.props().disabled).toBe(true);
    expect(greenButton.props().disabled).toBe(true);
  });

  it('will show a success message when the green wire is correctly cut', async () => {
    await selectWire('GREEN');

    // Find the green button and press it
    let redButton = appWrapper.find('button[data-testid="red-button"]');  
    let greenButton = appWrapper.find('button[data-testid="green-button"]');  

    await act(async () => await greenButton.simulate('click'));    
    appWrapper.update();

    expect(appWrapper.exists('p[data-testid="fetching-randoms"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(false);
    expect(appWrapper.find('p[data-testid="cutwire-text"]').text()).toBe(text.default.YOU_HAVE_DISARMED_THE_BOMB);

    // Buttons should be disabled, need to refetch the components

    redButton = appWrapper.find('button[data-testid="red-button"]');  
    greenButton = appWrapper.find('button[data-testid="green-button"]');  

    expect(redButton.props().disabled).toBe(true);
    expect(greenButton.props().disabled).toBe(true);
  });

  // **********
  it('will allow the user to try again', async () => {        

    // We want to fetch again
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {}));

    // Find the button and press it
    const tryAgain = appWrapper.find('button[data-testid="try-again-button"]');  
    await act(async () => await tryAgain.simulate('click'));    
    appWrapper.update();

    // Check that it is in a fetching state
    expect(appWrapper.find('p[data-testid="fetching-randoms"]').text()).toBe(text.default.FETCHING_RANDOMS);
  });
});

describe('When the user picks the wrong wire', () => {
  let appWrapper: any;
  
  const selectWire = async (wire: WireType) => {    
    await act(async () => { jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<any>((resolve, reject) => {       
      resolve({text: () => new Promise<any>((resolve, reject) => resolve(wire === 'RED' ? "0" : "1"))}); 
    }));       
    appWrapper = mount(
      <React.Fragment>
        <App />
      </React.Fragment>
    );    
    await flushPromises();  
    });    
    appWrapper.update();
  }
  
  afterAll(() => { 
    (global.fetch as any).mockClear();
  });

  it('will show that the bomb has exploded when the red wire is incorrectly cut', async () => {
    await selectWire('GREEN');

    // Find the red button and press it
    let redButton = appWrapper.find('button[data-testid="red-button"]');  

    await act(async () => await redButton.simulate('click'));    
    appWrapper.update();

    expect(appWrapper.exists('p[data-testid="fetching-randoms"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(true);
    expect(appWrapper.exists('div[data-testid="unexploded-section"]')).toBe(false);    
  });

  it('will show that the bomb has exploded when the green wire is incorrectly cut', async () => {
    await selectWire('RED');

    // Find the green button and press it
    let greenButton = appWrapper.find('button[data-testid="green-button"]');  

    await act(async () => await greenButton.simulate('click'));    
    appWrapper.update();

    expect(appWrapper.exists('p[data-testid="fetching-randoms"]')).toBe(false);
    expect(appWrapper.exists('div[data-testid="exploded-section"]')).toBe(true);
    expect(appWrapper.exists('div[data-testid="unexploded-section"]')).toBe(false);    
  });

});