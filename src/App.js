
import './App.css';
import { Label, ILabelStyles } from 'office-ui-fabric-react/lib/Label';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { IStyleSet } from 'office-ui-fabric-react/lib/Styling';
import { DetailsList, DetailsRow, IDetailsRowStyles, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import {ListeDesSeries} from './ListeSeries';



function App() {

  const listItems = [];
  const item = {"titre": "test", "nbre":"sexo"};
  listItems.push(item);


  return (
    <div className="App">
      <header className="App-header">
        <h1>J'ai baisé pointet</h1>
      <ListeDesSeries>
      </ListeDesSeries>
      </header>
    </div>
  );
}

export default App;
