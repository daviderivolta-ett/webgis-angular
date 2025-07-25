# Omirl
## Aggiunta layer
I layer si dividono in tre file principali: **base**, **data** ed **info**-layers.config.json.

### Struttura file
#### Base layer
Layer usati dall'app come base.

#### Info layer
Usati dall'app come layer aggiuntivi (es. confini province, fiumi, aree a rischio, ecc).

#### Data layer
Layer principali dell'app, usati come per visualizzare dati puntuali o areali, tramite GeoJSON e WMS.

### Struttura layer
L'app gestisce una classe astratta Layer, che viene estesa da **Tilelayer**, **WMSLayer** e **GeoJSONLayer**, basandosi sul parametro **layerType** presente in tutti gli oggetti layer inclusi nei file di configurazione citati prima.

Tutti i layer compresi in **data-layers.config.json**, ovvero quelli presente nella sidebar della pagina **Dati** (componente **data-page.component.ts** in _src/pages/data/data-page_), sono di tipo **GeoJSONLayer** (layer GeoJSON con featureCollection di Feature Point) oppure **WMSLayer** (layer WMS, con timedimension o meno).

Ogni layer ha le sue proprietà specifiche (vedi i vari modelli in _src/models/layer_).

Nei file i layer sono raggruppati in oggetti **LayerGroup** (_src/models/layer/layer-group.class.ts_) per comodità di conversione con l'oggetto **GroupedCheckboxItem** (_src/models/ui/grouped-checkbox-item.class.ts_) che rappresenta la struttura dati delle checkbox nella sidebar preenta nella pagina **Dati**.

Importante anche il parametro **layerCategory**, su cui si basa la logica di mutua esclusività o meno delle varie tipologie di layer sulla mappa. Esiste un file di configurazione anche per decidere quali categorie sono incompatibili con quali altre: _public/configs/layer-categories.config.json_.

Ultimo, il campo **legend** è usato dall'applicativo per generare dinamicamente la legenda associata al layer selezionato. Le varie scale colori sono presenti nel file **color-scales.config.json** (_public/configs/color-scales.config.json_); oguna delle quali ha **colori** ed **id**.

### Struttura legenda
Il campo legend negli oggetti Layer ha obbligatoriamente l'id della scala da recuperare dal file di configurazione corrispondente. La scala da mostrare all'utente viene creata dinamicamente in base ad alcuni parametri presenti nel campo legend del file di configurazione del layer.

La legend viene usata per determinare i colori dei punti sulla mappa, in quanto necessari per aggiungere il cmapo **color** alle properties del GeoJSON.

Se presenti i campi **min** e **max** viene creato l'oggetto **ColorScale** con tanti colori quanti sono quelli della scala recuperata dal file di configurazione, e le **labels** e gli **steps** vengono creati di conseguenza.

Se presente il campo **steps** invece, questi verranno usati come **labels**. Inoltre questi verranno usati come valori di soglia per colorare i punti dei GeoJSON.

Se presente il campo **labels**, questo può esssere usato per mostrare i testi all'utente sulla legenda, ma ha bisogno di un campo **steps** per determinare i valori di soglia numerici con cui colorare i punti del GeoJSON.

### Flusso aggiunta
La pagina **Dati** recupera dal file di configurazione locale i dati dal file data-layers.config.json tramite il resolver **groupedCheckboxesResolver** (_src/resolvers/grouped-checkboxes.resolver.ts_) direttamente durante il routing.

Il resolver in particolare usa il service **ConfigService** (_src/services/config.service.ts_) ed il metodo **getDataLayers** per sapere quale file recuperare.

La pagina **Dati** poi crea in autonomia le checkbox della sidebar.

Alla selezione di un layer, il componente pagina cerca quale **Layer** deve attivare, crea la **ColorScale** basandosi sui dati delle scale colori salvati nel relativo file di configurazione ed i dati del campo **lagend** del singolo **Layer**. Una volta creato **ColorScale** ed ottenuto il **Layer** da attivare, esegue il comando.

Come?

Ogni oggetto **Layer** e derivati ha un campo **action**, modellato come _any_ in maniera da essere in grado di comportarsi come campo bonus.

Il campo action ha per convenzione un campo **id**, che serve all'app per sapere quale comando eseguire al click della checkbox del layer.

Ho infatti implementato una sorta di Command Pattern.

Esiste un service **CommandsRegistryService** (_src/services/registry.command.service.ts_) che ha un campo Map di comandi. Il metodo **getCommand** si occupa di recuperare il comando corretto quando richiesto.

Ogni comando è di fatto un service che implementa un interface Command, che ha solo un metodo **execute()**. Di conseguenza ogni comando ha obbligatoriamente un metodo **execute()**, che è ciò che viene invocato dal layer alla selezione.

I singoli comandi, ad ora, sono il male reincarnato in cui tutto vale. Il metodo **execute()** presente in tutti i servizi comandi accetta un args di tipo _any_, per cui gli si può passare tutto ed ogni comando è indipendente e custom.

Il singolo comando usa i dati dell'oggetto **Layer** e chiama direttamente il metodo della mappa che si occupa di mostrarlo all'utente.

Una volta che il **Layer** trova il comando corretto dal **CommandsRegistryService** passa al metodo **execute()** tutti i parametri di cui ha bisogno, e questo si occupa di recuperare i dati, creare il GeoJSON/WMS in maniera corretta ed invocare il metodo corretto della mappa per mostrarli.

Ad ora mi fa schifo che il comand accetti l'istanza della mappa per invocare i suoi metodi, ma ci ragionerò.

Per aggiungere nuovi layer è quindi sufficiente inserirli nel file di configurazione corrispondente, con i parametri necessari a fare la richiesta di GET.

Buona fortuna!