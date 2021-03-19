import { CIQ } from 'chartiq/js/chartiq';
import Polygon from '../../util/polygon';
import uiSettings from '../../config/ui'; 

const timeOptions = uiSettings.timeOptions('default');
export const initialState = {
  stx: null,
  polygon: Polygon('4uVVJPuqfx3sSr0YA8MFGAO9aTreizZV'),
  pairs: uiSettings.pairs,
  pair: uiSettings.pairs[0].value,
  chartTypes: uiSettings.chartTypes,
  chartType: uiSettings.chartTypes[0].value,
  timeOptions,
  timeOption: timeOptions[0].value,
  studyList: uiSettings.studyList,
  study: null,
  studyHelper:  null,
  lastQuote: { DT: new Date(), Value: 0 },
  showStudyModal: true,
  studyForm: {}
};

export const reducer = (state, action) => {
  switch (action.type) {

    case 'POLYGON_INIT':
      state.polygon.init()
      .then(() => state.polygon.subscribe(state.pair));
      return state;

    case 'SET_STX':
      return { ...state, stx: action.payload };

    case 'SET_TIME_OPTION':
      state.stx.setPeriodicity({
        period: action.payload,
        interval: 1,
        timeUnit: 'second'
      });
      return {...state, timeOption: action.payload};

    case 'SET_TIME_OPTIONS':
      return { ...state, timeOptions: action.payload };

    case 'LOAD_CHART':
      state.stx.loadChart(state.pair, []);
      return state;

    case 'SET_LAST_QUOTE':
      return { ...state, lastQuote: action.payload };

    case 'ATTACH_QUOTE_FEED':
      state.stx.attachQuoteFeed(state.polygon.quoteFeed, { 
        refreshInterval: 1, 
        callback: e => {
          if(e.chart.lastQuote)
            action.payload({type: 'SET_LAST_QUOTE', payload: e.chart.lastQuote})
        } 
      });
      return state;

    case 'SET_PAIR':
      console.log(action.payload);
      state.polygon.unsubscribe()
        .then(() => {
          state.polygon.subscribe(action.payload);
          reducer(state, {type: 'LOAD_CHART'});
        });
      return { ...state, pair: action.payload };

    case 'SET_CHART_TYPE':
      state.stx.setChartType(action.payload);
      return { ...state, chartType: action.payload };

    case 'ADD_STUDY':
      CIQ.Studies.addStudy(state.stx, action.payload.name);
      return state;

    case 'SHOW_STUDY_MODAL':
      return { ...state, showStudyModal: action.payload};

    case 'CLOSE_STUDY_MODAL':
      return { ...state, showStudyModal: false };

    case 'OPEN_STUDY_MODAL':
      const studyHelper = new CIQ.Studies.DialogHelper({ name: action.payload, stx: state.stx });
      return { 
        ...state, 
        study: null, 
        showStudyModal: true, 
        studyHelper,
        studyForm: {}
      };
    
    case 'SET_STUDY_FORM':
      return { ...state, studyForm: { ...state.studyForm, ...action.payload } };

    default:
      console.log(action);
      throw new Error();
  }
};
