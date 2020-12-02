import './ListeSeries.css';
import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode} from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';


export class ListeDesSeries extends React.Component {

     _allItems;
     _columns;
  
    constructor(props) {
      super(props);
  
  
      // Populate with items for demos.
      this._allItems = [];
      
  
      this._columns = [
        { key: 'column1', name: 'Titre de la série', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Année', fieldName: 'annee', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column3', name: 'Nom original', fieldName: 'realname', minWidth: 100, maxWidth: 200, isResizable: true }
      ];

      this._columnsEpisodes = [
        { key: 'column1', name: 'Titre de l\'épisode', fieldName: 'titre', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Numéro de l\'épisode', fieldName: 'numero', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column3', name: 'Saison', fieldName: 'saison', minWidth: 100, maxWidth: 200, isResizable: true }
      ];
      
  
      this.state = {
        items: [],
        itemsFull: [],
        isLoaded: false,
        affichePanelSerie: false,
        isModalSelection: false,
        serieAfficheeDanslePanel: null,
        listeSaisonsDeLaSerie: [],
        listeDesEpisodesDeLaSaison: [],
        indexSaisonSelected: [],
        erreurEpisodes: false
      };
    }

    componentDidMount() {
      fetch("https://www.devatom.net/API/api.php?data=series")
        .then(res => res.json())
        .then(
          (result) => {
            let seriesList = [];
            result.forEach(serie => {
                let serieFormat = { key:serie.id, name:serie.nom, annee:serie.anneeparution, realname:serie.nomoriginal}
                seriesList.push(serieFormat);
            })
            this.setState({
              isLoaded: true,
              items: seriesList,
              itemsFull: result
            });
          },
          // Remarque : il est important de traiter les erreurs ici
          // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
          // des exceptions provenant de réels bugs du composant.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    }
  
     render() {
  
        if (!this.state.isLoaded){

          return ( 
            <React.Fragment>
            <div className="loader"></div>
            </React.Fragment>
            
          )
        } else {
          return (
            <React.Fragment>
              <Panel
          isLightDismiss
          isOpen={this.state.affichePanelSerie}
          onDismiss={this._onDismiss}
          headerText={this.state.serieAfficheeDanslePanel ? this.state.serieAfficheeDanslePanel.nom : "Aucune série"}
          type={PanelType.medium}
        >
          <Dropdown
        placeholder="Choisissez une saison"
        label= {this.state.serieAfficheeDanslePanel && this.state.listeSaisonsDeLaSerie.length > 0 ? "Saisons de " + this.state.serieAfficheeDanslePanel.nom : "Pas encore de saisons pour cette série"}
        options={this.state.listeSaisonsDeLaSerie}
        onChange={(event, item) => this._getEpisodesDuneSaison(item)}
      />
          {this.state.erreurEpisodes ? (
            <p>Aucun épisode pour cette saison</p>
          ) : (<DetailsList
                items={this.state.listeDesEpisodesDeLaSaison}
                columns={this._columnsEpisodes}
                setKey="set"
                selectionMode = {SelectionMode.none}
                layoutMode={DetailsListLayoutMode.justified}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="Row checkbox"
                onItemInvoked={this._onItemInvoked}
              />)}
        </Panel>
  
              <DetailsList
                items={this.state.items}
                columns={this._columns}
                setKey="set"
                selectionMode = {SelectionMode.none}
                layoutMode={DetailsListLayoutMode.justified}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="Row checkbox"
                onItemInvoked={this._onItemInvoked}
              />
              </React.Fragment>
          )
        }
    }

  
    _onItemInvoked = (item) => {
      let itemFullsList = this.state.itemsFull;
      itemFullsList.forEach(iF => {
        if (iF.id === item.key){
          fetch("https://www.devatom.net/API/api.php?data=saisons&idserie=" + iF.id)
          .then(res => {
            res.text().then(result => {
              if (result === "Aucun enregistrement ne correspond à la demande"){
                this.setState({
                  serieAfficheeDanslePanel: iF,
                  listeSaisonsDeLaSerie: [],
                  affichePanelSerie: true
                })
              } else {
                  let resultTableau = JSON.parse(result);
                  let listeSaisons = [];
                  let indice = 0;
                  resultTableau.forEach(saison => {
                    indice++;
                    let uneSaison = {key:indice, text:"Saison " + indice, id:saison.id}
                    listeSaisons.push(uneSaison);
                  })
      
                  this.setState({
                    serieAfficheeDanslePanel: iF,
                    listeSaisonsDeLaSerie: listeSaisons,
                    affichePanelSerie: true
                  })
                
              }
            });
             
        })
        }
      })
      
    };

    _onDismiss = () => {
      this.setState({
        affichePanelSerie: false,
        listeDesEpisodesDeLaSaison: [],
        listeSaisonsDeLaSerie: []
      })
    }

    _getEpisodesDuneSaison = (item) => {
      fetch("https://www.devatom.net/API/api.php?data=episodes&idsaison=" + item.id)
      .then(res => res.text().then(result => {
        if (result === "Aucun enregistrement ne correspond à la demande"){
          this.setState({
            listeDesEpisodesDeLaSaison: [],
            erreurEpisodes: true
          })
        } else {
                let resultTableau = JSON.parse(result);
                  let listeEpisodes = [];
                  let indice = 0;
                  resultTableau.forEach(episode => {
                    indice++;
                    let unEpisode = {key:indice, titre:episode.titre, numero:episode.numero, saison:episode.Saison}
                    listeEpisodes.push(unEpisode);
                  })
      
                  this.setState({
                    erreurEpisodes: false,
                    listeDesEpisodesDeLaSaison: listeEpisodes
                  })
        }
      }))
    }
  }