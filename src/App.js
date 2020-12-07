
import './App.css';
import img from './logo.png'
import { Label, ILabelStyles } from 'office-ui-fabric-react/lib/Label';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { IStyleSet } from 'office-ui-fabric-react/lib/Styling';
import { DetailsList, DetailsRow, IDetailsRowStyles, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import {ListeDesSeries} from './ListeSeries';



function App() {

  return (
    <div className="App">
      <header className="App-header">
        <div></div>
        <img className="App-logo" src={img} alt="logo"/>
        <h1>MyNetflix</h1>
        <img className="App-logo" src={img} alt="logo"/>
      </header>
      <body>
      <ListeDesSeries>
      </ListeDesSeries>
      </body>
    </div>
  );
}

export default App;
