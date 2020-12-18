import './ListeSeries.css';
import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode} from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { loadTheme } from 'office-ui-fabric-react';

const headerStyle = {
  cellTitle: {
    color: "#c71f20",
    background: "#131313"
  }
}

const caseStyle = {
  cellTitle: {
    color: "#ffffff",
    background: "#131313"
  }
}

const listStyle = {
  root:{
    background:"#131313"
  }
}



export class ListeDesSeries extends React.Component {

     
     _columns;
  
    constructor(props) {
      super(props);
  
      
  
      this._columns = [
        { styles: headerStyle ,key: 'column1', name: 'Titre de la série', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { styles: headerStyle ,key: 'column2', name: 'Année', fieldName: 'annee', minWidth: 100, maxWidth: 200, isResizable: true },
        { styles: headerStyle ,key: 'column3', name: 'Nom original', fieldName: 'realname', minWidth: 100, maxWidth: 200, isResizable: true },
        { styles: headerStyle ,key: 'column4', name: 'Nombre de saisons', fieldName: 'nbreSaisons', minWidth: 100, maxWidth: 200, isResizable: true }
      ];

      this._columnsEpisodes = [
        { styles: headerStyle ,key: 'column1', name: 'Titre de l\'épisode', fieldName: 'titre', minWidth: 100, maxWidth: 200, isResizable: true },
        { styles: headerStyle ,key: 'column2', name: 'Numéro de l\'épisode', fieldName: 'numero', minWidth: 100, maxWidth: 200, isResizable: true },
        { styles: headerStyle ,key: 'column3', name: 'Saison', fieldName: 'saison', minWidth: 100, maxWidth: 200, isResizable: true }
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
    // Au moment ou le composant est appelé on déclenche une requête http pour récupérer la liste de séries ainsi que de le
    // nombre de séries qu'elle contient
    componentDidMount() {
      fetch("https://www.devatom.net/API/api.php?data=series")
        .then(res => res.json()
        .then(
          (result) => {
            let seriesList = [];
            result.forEach(serie => {
                let nbreDeSaisons;
                fetch("https://www.devatom.net/API/api.php?data=saisons&idserie=" + serie.id)
                .then(res2 => {
                  res2.text().then(result2 => {
                    if (result2 === "Aucun enregistrement ne correspond à la demande"){
                      nbreDeSaisons = 0;
                    } else {
                        let resulttableau = JSON.parse(result2);
                        nbreDeSaisons = resulttableau.length
                    }
                    let serieFormat = { styles: caseStyle ,key:serie.id, name:serie.nom, annee:serie.anneeparution, realname:serie.nomoriginal, nbreSaisons: nbreDeSaisons}
                    seriesList.push(serieFormat);
                    //On ajoute chaque série dans la liste que l'on affichera plus tard dans un format spécifique
                  });
                });
            })
            this.setState({
              isLoaded: true,
              items: seriesList,
              itemsFull: result
            });
          }
        )
          ,
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
            //Petit Loader pour le court temps de chargement
            <React.Fragment>
            <div className="loader"></div>
            </React.Fragment>
            
          )
        } else {
          return (
            <React.Fragment> // Le composant Fragment permets de pouvoir afficher plusieurs composants ensemble
              <Panel //Panel que l'on peut fermer en cliquant partout ailleurs
          isLightDismiss
          isOpen={this.state.affichePanelSerie}
          onDismiss={this._onDismiss}
          headerText={this.state.serieAfficheeDanslePanel ? this.state.serieAfficheeDanslePanel.nom : "Aucune série"}
          type={PanelType.medium}
        >
          <Dropdown //Liste des saisons d'une série
        placeholder="Choisissez une saison"
        label= {this.state.serieAfficheeDanslePanel && this.state.listeSaisonsDeLaSerie.length > 0 ? "Saisons de " + this.state.serieAfficheeDanslePanel.nom : "Pas encore de saisons pour cette série"}
        options={this.state.listeSaisonsDeLaSerie}
        onChange={(event, item) => this._getEpisodesDuneSaison(item)}
      />
          {this.state.erreurEpisodes ? (
            <p>Aucun épisode pour cette saison</p>//Si il y a des épisode on les affiche sinon, on prévient qu'il n'y en a pas
          ) : (<DetailsList
                items={this.state.listeDesEpisodesDeLaSaison}
                columns={this._columnsEpisodes}
                setKey="set"
                selectionMode = {SelectionMode.none}
                layoutMode={DetailsListLayoutMode.justified}
                onItemInvoked={this._onItemInvoked}
              />)}
        </Panel>
  
              <DetailsList //Liste des séries
                items={this.state.items}
                columns={this._columns}
                setKey="set"
                selectionMode = {SelectionMode.none}
                layoutMode={DetailsListLayoutMode.justified}
                onItemInvoked={this._onItemInvoked}
                styles={listStyle}
              />
              </React.Fragment>
          )
        }
    }

  //Lorsqu'on double clic sur une série, on charge les saisons et les épisode de la série + on affiche le panel avec toutes ces infos
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
    // On charge les épisodes d'une saison quand on selectionne une saison
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
                    let unEpisode = {styles: caseStyle ,key:indice, titre:episode.titre, numero:episode.numero, saison:episode.Saison}
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