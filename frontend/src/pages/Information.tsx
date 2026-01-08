import React from 'react';
import { Info, BookOpen, HelpCircle, FileText, Users, Globe, Layers, ExternalLink, Package, FileCode } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';

// Immagine architettura principale
import architectureMain from '../assets/logos/others/Databricks-HL-Architecture.png';

// Componenti architettura
import agentBricks from '../assets/logos/others/architecture components/Agent Bricks - Agentic AI.png';
import aiBI from '../assets/logos/others/architecture components/AI:BI - Business Intelligence.png';
import apps from '../assets/logos/others/architecture components/Apps - Interactive Applications.png';
import collaboration from '../assets/logos/others/architecture components/Collaboration - Delta Sharing, Marketplace, Clean Room.png';
import dbSQL from '../assets/logos/others/architecture components/DB SQL - Data Warehousing.png';
import deltaLake from '../assets/logos/others/architecture components/Delta Lake - Open Storage Layer.png';
import lakebase from '../assets/logos/others/architecture components/Lakebase - Transactional Database.png';
import lakeflow from '../assets/logos/others/architecture components/Lakeflow - Ingest, ETL, Streaming.png';
import marketplace from '../assets/logos/others/architecture components/Marketplace - Data & AI Marketplace.png';
import mlflow from '../assets/logos/others/architecture components/MLflow - ML Lifecycle Platform.png';
import spark from '../assets/logos/others/architecture components/Spark - Unified Analytics Engine.png';
import unityCatalog from '../assets/logos/others/architecture components/Unity Catalog - Governance.png';

const Information: React.FC = () => {
  const menuItems = [
    {
      id: 'about',
      label: 'Chi Siamo',
      icon: Info,
      description: 'Scopri di più sul progetto'
    },
    {
      id: 'guide',
      label: 'Guida Utente',
      icon: BookOpen,
      description: 'Come utilizzare la piattaforma'
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      description: 'Domande frequenti'
    },
    {
      id: 'architecture',
      label: 'Architettura',
      icon: Layers,
      description: 'Struttura tecnica della piattaforma'
    },
    {
      id: 'terms',
      label: 'Termini di Servizio',
      icon: FileText,
      description: 'Condizioni di utilizzo'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Globe,
      description: 'Informativa sulla privacy'
    },
    {
      id: 'contacts',
      label: 'Contatti',
      icon: Users,
      description: 'Come raggiungerci'
    }
  ];

  const [selectedSection, setSelectedSection] = React.useState('about');
  const [architectureTab, setArchitectureTab] = React.useState('platform');
  const [isImageEnlarged, setIsImageEnlarged] = React.useState(false);
  const [enlargedDiagram, setEnlargedDiagram] = React.useState<string | null>(null);

  // Definizione componenti architetturali
  const architectureComponents = [
    {
      id: 'agent-bricks',
      name: 'Agent Bricks',
      subtitle: 'Agentic AI',
      image: agentBricks,
      description: 'Framework per la creazione e gestione di agenti AI intelligenti che possono operare autonomamente e prendere decisioni basate su contesto e obiettivi.',
      productUrl: 'https://www.databricks.com/product/artificial-intelligence',
      docsUrl: 'https://docs.databricks.com/aws/en/machine-learning/'
    },
    {
      id: 'ai-bi',
      name: 'AI/BI',
      subtitle: 'Business Intelligence',
      image: aiBI,
      description: 'Suite avanzata di Business Intelligence potenziata dall\'intelligenza artificiale per analisi predittive e insight automatici sui dati aziendali.',
      productUrl: 'https://www.databricks.com/product/ai-bi',
      docsUrl: 'https://docs.databricks.com/aws/en/ai-bi/concepts'
    },
    {
      id: 'apps',
      name: 'Apps',
      subtitle: 'Interactive Applications',
      image: apps,
      description: 'Piattaforma per lo sviluppo e il deploy di applicazioni interattive che interagiscono direttamente con i dati del lakehouse.',
      productUrl: 'https://www.databricks.com/product/databricks-apps',
      docsUrl: 'https://docs.databricks.com/aws/en/dev-tools/databricks-apps'
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      subtitle: 'Delta Sharing, Marketplace, Clean Room',
      image: collaboration,
      description: 'Strumenti per la condivisione sicura dei dati, marketplace per dataset e clean room per analisi collaborative mantenendo la privacy.',
      productUrl: 'https://www.databricks.com/product/delta-sharing',
      docsUrl: 'https://docs.databricks.com/en/delta-sharing/index.html'
    },
    {
      id: 'db-sql',
      name: 'DB SQL',
      subtitle: 'Data Warehousing',
      image: dbSQL,
      description: 'SQL engine ottimizzato per query analitiche su larga scala con performance elevate e compatibilità con strumenti BI standard.',
      productUrl: 'https://www.databricks.com/product/databricks-sql',
      docsUrl: 'https://docs.databricks.com/en/sql/index.html'
    },
    {
      id: 'lakebase',
      name: 'Lakebase',
      subtitle: 'Transactional Database',
      image: lakebase,
      description: 'Database transazionale che combina le capacità ACID di un database tradizionale con la scalabilità e flessibilità di un data lake.',
      productUrl: 'https://www.databricks.com/product/lakebase',
      docsUrl: 'https://docs.databricks.com/aws/en/oltp/'
    },
    {
      id: 'lakeflow',
      name: 'Lakeflow',
      subtitle: 'Ingest, ETL, Streaming',
      image: lakeflow,
      description: 'Pipeline unificate per l\'ingestion di dati, trasformazioni ETL e processing di stream in tempo reale.',
      productUrl: 'https://www.databricks.com/product/data-engineering',
      docsUrl: 'https://docs.databricks.com/aws/en/data-engineering/'
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      subtitle: 'Data & AI Marketplace',
      image: marketplace,
      description: 'Marketplace aperto per lo scambio di dati, analytics e AI con condivisione sicura tramite Delta Sharing. Accesso a dataset, modelli ML, notebook e soluzioni senza dipendenze da piattaforme proprietarie.',
      productUrl: 'https://www.databricks.com/product/marketplace',
      docsUrl: 'https://docs.databricks.com/aws/en/marketplace'
    },
    {
      id: 'unity-catalog',
      name: 'Unity Catalog',
      subtitle: 'Governance',
      image: unityCatalog,
      description: 'Sistema centralizzato per la governance dei dati con gestione di metadati, lineage, controllo degli accessi e audit trail.',
      productUrl: 'https://www.databricks.com/product/unity-catalog',
      docsUrl: 'https://docs.databricks.com/en/data-governance/unity-catalog/index.html'
    },
    {
      id: 'spark',
      name: 'Apache Spark',
      subtitle: 'Unified Analytics Engine',
      image: spark,
      description: 'Motore di analisi unificato per l\'elaborazione di dati su larga scala con supporto per SQL, streaming, machine learning e graph processing.',
      productUrl: 'https://www.databricks.com/product/spark',
      docsUrl: 'https://docs.databricks.com/aws/en/spark/'
    },
    {
      id: 'delta-lake',
      name: 'Delta Lake',
      subtitle: 'Open Storage Layer',
      image: deltaLake,
      description: 'Livello di storage open-source che porta affidabilità ai data lake con transazioni ACID, gestione dei metadati scalabile e unificazione di batch e streaming.',
      productUrl: 'https://www.databricks.com/product/lakehouse-storage',
      docsUrl: 'https://docs.databricks.com/aws/en/delta'
    },
    {
      id: 'mlflow',
      name: 'MLflow',
      subtitle: 'ML Lifecycle Platform',
      image: mlflow,
      description: 'Piattaforma open-source per la gestione del ciclo di vita del machine learning con tracking degli esperimenti, packaging dei modelli e deployment.',
      productUrl: 'https://www.databricks.com/product/managed-mlflow',
      docsUrl: 'https://docs.databricks.com/aws/en/mlflow3/genai/'
    }
  ];

  const sidebar = (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-color)'
      }}>
        <HelpCircle size={28} style={{ color: '#6366f1' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
          Informazioni
        </h2>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setSelectedSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '1rem',
                marginBottom: '0.5rem',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? '#6366f1' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {item.label}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  opacity: 0.8,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)'
                }}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'about':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Info size={32} style={{ color: '#6366f1' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Chi Siamo</h2>
            </div>
            
            <div style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Web Democracy</strong> è una piattaforma innovativa per la gestione di sondaggi e la partecipazione democratica.
              </p>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                La nostra missione
              </h3>
              <p>
                Facilitare la partecipazione attiva dei cittadini attraverso strumenti digitali moderni e intuitivi.
              </p>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Caratteristiche principali
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Creazione semplice di sondaggi</li>
                <li style={{ marginBottom: '0.75rem' }}>Supporto per diversi tipi di domande</li>
                <li style={{ marginBottom: '0.75rem' }}>Risultati in tempo reale</li>
                <li style={{ marginBottom: '0.75rem' }}>Sondaggi anonimi e pubblici</li>
                <li style={{ marginBottom: '0.75rem' }}>Gestione avanzata dei partecipanti</li>
              </ul>
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <BookOpen size={32} style={{ color: '#6366f1' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Guida Utente</h2>
            </div>
            
            <div style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Come creare un sondaggio
              </h3>
              <ol style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Clicca su "Crea Sondaggio" nella barra di navigazione</li>
                <li style={{ marginBottom: '0.75rem' }}>Compila le informazioni di base (titolo, descrizione)</li>
                <li style={{ marginBottom: '0.75rem' }}>Scegli il tipo di domanda</li>
                <li style={{ marginBottom: '0.75rem' }}>Aggiungi le opzioni di risposta</li>
                <li style={{ marginBottom: '0.75rem' }}>Configura le impostazioni avanzate</li>
                <li style={{ marginBottom: '0.75rem' }}>Pubblica il sondaggio</li>
              </ol>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Come partecipare a un sondaggio
              </h3>
              <ol style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Vai alla sezione "Sondaggi"</li>
                <li style={{ marginBottom: '0.75rem' }}>Scegli un sondaggio dalla lista</li>
                <li style={{ marginBottom: '0.75rem' }}>Leggi attentamente la domanda</li>
                <li style={{ marginBottom: '0.75rem' }}>Seleziona la tua risposta</li>
                <li style={{ marginBottom: '0.75rem' }}>Conferma il voto</li>
                <li style={{ marginBottom: '0.75rem' }}>Visualizza i risultati (se disponibili)</li>
              </ol>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Tipi di sondaggio
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}><strong>Scelta Singola:</strong> Una sola risposta possibile</li>
                <li style={{ marginBottom: '0.75rem' }}><strong>Scelta Multipla:</strong> Più risposte possibili</li>
                <li style={{ marginBottom: '0.75rem' }}><strong>Valutazione:</strong> Assegna un punteggio (es. 1-5 stelle)</li>
                <li style={{ marginBottom: '0.75rem' }}><strong>Scala Numerica:</strong> Valore numerico su una scala</li>
                <li style={{ marginBottom: '0.75rem' }}><strong>Data:</strong> Selezione di una data</li>
                <li style={{ marginBottom: '0.75rem' }}><strong>Risposta Aperta:</strong> Testo libero</li>
              </ul>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <HelpCircle size={32} style={{ color: '#6366f1' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Domande Frequenti</h2>
            </div>
            
            <div style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Posso votare più volte nello stesso sondaggio?
                </h3>
                <p>No, ogni utente può votare una sola volta per sondaggio. Il sistema previene voti duplicati.</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Cosa significa sondaggio anonimo?
                </h3>
                <p>In un sondaggio anonimo, i voti non sono associati all'identità degli utenti. Nessuno può sapere chi ha votato cosa.</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Posso modificare un sondaggio dopo averlo creato?
                </h3>
                <p>Puoi modificare alcune impostazioni, ma non è possibile cambiare le opzioni di voto dopo che qualcuno ha già votato.</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Come posso vedere i risultati di un sondaggio?
                </h3>
                <p>Clicca sul sondaggio nella lista e poi su "Visualizza Risultati". La disponibilità dipende dalle impostazioni del sondaggio.</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Posso proporre nuove opzioni in un sondaggio?
                </h3>
                <p>Sì, se il creatore del sondaggio ha abilitato l'opzione "Permetti opzioni personalizzate".</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Come funziona il gradimento dei sondaggi?
                </h3>
                <p>Puoi esprimere un gradimento da 1 a 5 stelle per ogni sondaggio, indipendentemente dal tuo voto.</p>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <FileText size={32} style={{ color: '#6366f1' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Termini di Servizio</h2>
            </div>
            
            <div style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                Ultimo aggiornamento: Novembre 2024
              </p>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                1. Accettazione dei termini
              </h3>
              <p>
                Utilizzando questa piattaforma, accetti di essere vincolato da questi termini di servizio e dalla nostra politica sulla privacy.
              </p>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                2. Utilizzo del servizio
              </h3>
              <p>
                Ti impegni a utilizzare la piattaforma in modo responsabile e conforme alle leggi vigenti. È vietato:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Creare contenuti offensivi o illegali</li>
                <li style={{ marginBottom: '0.75rem' }}>Tentare di manipolare i risultati dei sondaggi</li>
                <li style={{ marginBottom: '0.75rem' }}>Violare la privacy di altri utenti</li>
                <li style={{ marginBottom: '0.75rem' }}>Utilizzare la piattaforma per scopi commerciali non autorizzati</li>
              </ul>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                3. Proprietà intellettuale
              </h3>
              <p>
                Tutti i contenuti creati dagli utenti rimangono di loro proprietà. La piattaforma mantiene una licenza d'uso per fornire il servizio.
              </p>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                4. Limitazione di responsabilità
              </h3>
              <p>
                La piattaforma è fornita "così com'è" senza garanzie di alcun tipo. Non siamo responsabili per eventuali danni derivanti dall'uso del servizio.
              </p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Globe size={32} style={{ color: '#6366f1' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Informativa sulla Privacy</h2>
            </div>
            
            <div style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Raccolta dei dati
              </h3>
              <p>
                Raccogliamo solo i dati necessari per fornire il servizio:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Informazioni di registrazione (email, nome utente)</li>
                <li style={{ marginBottom: '0.75rem' }}>Voti espressi nei sondaggi</li>
                <li style={{ marginBottom: '0.75rem' }}>Dati di utilizzo della piattaforma</li>
                <li style={{ marginBottom: '0.75rem' }}>Indirizzo IP (per prevenire abusi)</li>
              </ul>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Utilizzo dei dati
              </h3>
              <p>
                I tuoi dati sono utilizzati esclusivamente per:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Fornire e migliorare il servizio</li>
                <li style={{ marginBottom: '0.75rem' }}>Prevenire abusi e frodi</li>
                <li style={{ marginBottom: '0.75rem' }}>Comunicare aggiornamenti importanti</li>
                <li style={{ marginBottom: '0.75rem' }}>Analizzare l'utilizzo della piattaforma</li>
              </ul>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Protezione dei dati
              </h3>
              <p>
                Implementiamo misure di sicurezza appropriate per proteggere i tuoi dati personali da accessi non autorizzati, alterazioni o divulgazioni.
              </p>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Sondaggi anonimi
              </h3>
              <p>
                Nei sondaggi anonimi, i voti non sono associati all'identità degli utenti e non possono essere tracciati.
              </p>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                I tuoi diritti
              </h3>
              <p>
                Hai il diritto di:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>Accedere ai tuoi dati personali</li>
                <li style={{ marginBottom: '0.75rem' }}>Richiedere la correzione di dati errati</li>
                <li style={{ marginBottom: '0.75rem' }}>Richiedere la cancellazione del tuo account</li>
                <li style={{ marginBottom: '0.75rem' }}>Opporti al trattamento dei tuoi dati</li>
              </ul>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            {/* Tab Navigation - Stile lineare */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '2rem',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '2rem'
            }}>
              {[
                { id: 'platform', label: 'Piattaforma' },
                { id: 'solution', label: 'Soluzione' },
                { id: 'webapp-architecture', label: 'WebApp Architecture' },
                { id: 'webapp-ui', label: 'WebApp UI' },
                { id: 'database', label: 'Database' },
                { id: 'deployment', label: 'Deployment' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setArchitectureTab(tab.id)}
                  style={{
                    padding: '0.75rem 0',
                    border: 'none',
                    background: 'transparent',
                    color: architectureTab === tab.id ? '#6366f1' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: architectureTab === tab.id ? '600' : '500',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    borderBottom: architectureTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                    marginBottom: '-1px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (architectureTab !== tab.id) {
                      e.currentTarget.style.color = '#6366f1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (architectureTab !== tab.id) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Contenuto dei Tab */}
            {architectureTab === 'platform' && (
              <>
                {/* Immagine Architettura Principale */}
                <div style={{
                  marginBottom: '3rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
              <div
                onClick={() => setIsImageEnlarged(true)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'inline-block'
                }}
                title="Clicca per ingrandire"
              >
                <img 
                  src={architectureMain} 
                  alt="Databricks High-Level Architecture" 
                  style={{ 
                    width: '100%',
                    maxWidth: '1000px',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                />
              </div>
              <p style={{ 
                marginTop: '1.5rem', 
                fontSize: '0.875rem', 
                color: 'var(--text-tertiary)',
                fontStyle: 'italic'
              }}>
                Architettura High-Level della piattaforma Databricks
              </p>
            </div>

            {/* Modal per immagine ingrandita */}
            {isImageEnlarged && (
              <div
                onClick={() => setIsImageEnlarged(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  cursor: 'zoom-out',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ position: 'relative', maxWidth: '95%', maxHeight: '95%' }}>
                  <img
                    src={architectureMain}
                    alt="Databricks High-Level Architecture (Ingrandita)"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '90vh',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 0 40px rgba(255,255,255,0.1)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => setIsImageEnlarged(false)}
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      right: '-15px',
                      background: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f0f0';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                  <p style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    opacity: 0.8
                  }}>
                    Clicca ovunque per chiudere
                  </p>
                </div>
              </div>
            )}

            {/* Sezioni dei Componenti */}
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '2rem', 
              color: 'var(--text-primary)',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '0.75rem'
            }}>
              Componenti Architetturali
            </h3>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1.5rem' 
            }}>
              {architectureComponents.map((component, index) => (
                <div 
                  key={component.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Immagine del componente */}
                  <div style={{ 
                    flexShrink: 0,
                    width: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={component.image} 
                      alt={component.name} 
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain'
                      }} 
                    />
                  </div>

                  {/* Dettagli del componente */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      marginBottom: '0.125rem'
                    }}>
                      {component.name}
                    </h4>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#ff4500',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      {component.subtitle}
                    </p>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      lineHeight: '1.5', 
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem'
                    }}>
                      {component.description}
                    </p>

                    {/* Link esterni */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      marginTop: '0.75rem'
                    }}>
                      <a
                        href={component.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          background: '#ff4500',
                          color: '#ffffff',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ff6a33';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ff4500';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Package size={14} />
                        Prod
                      </a>
                      
                      <a
                        href={component.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          background: '#6366f1',
                          color: '#ffffff',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#818cf8';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#6366f1';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FileCode size={14} />
                        Docs
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {architectureTab === 'solution' && (
          <div style={{ padding: '2rem 0' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem', 
              color: 'var(--text-primary)'
            }}>
              Soluzione Dati
            </h3>
            <p style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              La gestione dei dati è al centro della nostra piattaforma, garantendo integrità, disponibilità e performance.
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.75rem' }}><strong>Data Lake:</strong> Integrazione con LakeBase per storage centralizzato</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>Real-time Analytics:</strong> Elaborazione in tempo reale dei risultati dei sondaggi</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>Backup & Recovery:</strong> Strategie di backup automatico e disaster recovery</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>GDPR Compliant:</strong> Conformità totale alle normative sulla privacy</li>
            </ul>
          </div>
        )}

        {architectureTab === 'webapp-architecture' && (
          <div style={{ padding: '2rem 0' }}>
            {/* Diagramma architettura - Stile ultra minimal */}
            <div 
              data-diagram="webapp-arch"
              onClick={() => setEnlargedDiagram('webapp-arch')}
              style={{
                background: '#ffffff',
                borderRadius: '4px',
                padding: '3rem',
                marginBottom: '2rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg viewBox="0 0 700 480" style={{ width: '100%', height: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <defs>
                  {/* Arrow marker */}
                  <marker id="arrowMinimal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M 0 0 L 10 3 L 0 6 Z" fill="#4b5563"/>
                  </marker>
                </defs>
                
                {/* Frontend Layer */}
                <g>
                  <rect x="80" y="40" width="540" height="90" 
                    fill="#ffffff" 
                    stroke="#4b5563" 
                    strokeWidth="2"/>
                  
                  <text x="350" y="75" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="600">
                    Frontend
                  </text>
                  <text x="350" y="100" textAnchor="middle" fill="#6b7280" fontSize="14">
                    React + TypeScript
                  </text>
                  <line x1="80" y1="110" x2="620" y2="110" stroke="#e5e7eb" strokeWidth="1"/>
                  <text x="130" y="122" fill="#9ca3af" fontSize="12">Components</text>
                  <text x="270" y="122" fill="#9ca3af" fontSize="12">State</text>
                  <text x="380" y="122" fill="#9ca3af" fontSize="12">Router</text>
                  <text x="500" y="122" fill="#9ca3af" fontSize="12">API</text>
                </g>
                
                {/* Arrow 1 */}
                <g>
                  <line x1="350" y1="130" x2="350" y2="180" 
                    stroke="#4b5563" 
                    strokeWidth="1.5"
                    markerEnd="url(#arrowMinimal)"/>
                  <text x="365" y="158" fill="#6b7280" fontSize="11">REST API</text>
                </g>
                
                {/* Backend Layer */}
                <g>
                  <rect x="80" y="190" width="540" height="90" 
                    fill="#ffffff" 
                    stroke="#4b5563" 
                    strokeWidth="2"/>
                  
                  <text x="350" y="225" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="600">
                    Backend
                  </text>
                  <text x="350" y="250" textAnchor="middle" fill="#6b7280" fontSize="14">
                    FastAPI (Python)
                  </text>
                  <line x1="80" y1="260" x2="620" y2="260" stroke="#e5e7eb" strokeWidth="1"/>
                  <text x="120" y="272" fill="#9ca3af" fontSize="12">Endpoints</text>
                  <text x="240" y="272" fill="#9ca3af" fontSize="12">Auth</text>
                  <text x="340" y="272" fill="#9ca3af" fontSize="12">Logic</text>
                  <text x="450" y="272" fill="#9ca3af" fontSize="12">ORM</text>
                </g>
                
                {/* Arrow 2 */}
                <g>
                  <line x1="350" y1="280" x2="350" y2="330" 
                    stroke="#4b5563" 
                    strokeWidth="1.5"
                    markerEnd="url(#arrowMinimal)"/>
                  <text x="365" y="308" fill="#6b7280" fontSize="11">SQL</text>
                </g>
                
                {/* Database Layer */}
                <g>
                  <rect x="80" y="340" width="540" height="80" 
                    fill="#ffffff" 
                    stroke="#4b5563" 
                    strokeWidth="2"/>
                  
                  <text x="350" y="375" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="600">
                    Database
                  </text>
                  <text x="350" y="400" textAnchor="middle" fill="#6b7280" fontSize="14">
                    PostgreSQL / Lakebase
                  </text>
                </g>
                
                {/* Labels laterali */}
                <g>
                  <text x="40" y="85" textAnchor="end" fill="#9ca3af" fontSize="11">UI</text>
                  <text x="40" y="235" textAnchor="end" fill="#9ca3af" fontSize="11">API</text>
                  <text x="40" y="385" textAnchor="end" fill="#9ca3af" fontSize="11">DB</text>
                </g>
                
                {/* Nota */}
                <text x="350" y="460" textAnchor="middle" fill="#9ca3af" fontSize="10">
                  Three-tier architecture | Separation of concerns | RESTful communication
                </text>
              </svg>
            </div>

            {/* Descrizione tecnica - Stile minimal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem'
            }}>
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '4px',
                border: '2px solid #e5e7eb'
              }}>
                <h4 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', fontFamily: "'Courier New', monospace" }}>Frontend Layer</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9375rem', lineHeight: '1.8', color: '#6b7280', fontFamily: "'Courier New', monospace" }}>
                  <li style={{ marginBottom: '0.5rem' }}>→ React 18 con TypeScript</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ React Router per navigazione</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Lucide Icons per UI</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Recharts per visualizzazioni</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Axios per HTTP requests</li>
                </ul>
              </div>

              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '4px',
                border: '2px solid #e5e7eb'
              }}>
                <h4 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', fontFamily: "'Courier New', monospace" }}>Backend Layer</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9375rem', lineHeight: '1.8', color: '#6b7280', fontFamily: "'Courier New', monospace" }}>
                  <li style={{ marginBottom: '0.5rem' }}>→ FastAPI framework</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Pydantic per validazione</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ SQLAlchemy ORM</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ CORS middleware</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Session-based auth</li>
                </ul>
              </div>

              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '4px',
                border: '2px solid #e5e7eb'
              }}>
                <h4 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', fontFamily: "'Courier New', monospace" }}>Database Layer</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9375rem', lineHeight: '1.8', color: '#6b7280', fontFamily: "'Courier New', monospace" }}>
                  <li style={{ marginBottom: '0.5rem' }}>→ PostgreSQL 13+</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ 12 tabelle normalizzate</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Indici ottimizzati</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Foreign keys & constraints</li>
                  <li style={{ marginBottom: '0.5rem' }}>→ Compatible con Lakebase</li>
                </ul>
              </div>
            </div>

            {/* API Endpoints Summary - Stile minimal */}
            <div style={{
              marginTop: '2rem',
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '4px',
              border: '2px solid #e5e7eb'
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', fontFamily: "'Courier New', monospace" }}>
                API Endpoints Principali
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <div>
                  <strong style={{ color: '#1f2937', fontFamily: "'Courier New', monospace" }}>GET</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.6', fontFamily: "'Courier New', monospace" }}>
                    <li>/api/user</li>
                    <li>/surveys</li>
                    <li>/surveys/:id</li>
                    <li>/surveys/:id/results</li>
                    <li>/surveys/:id/stats</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#1f2937', fontFamily: "'Courier New', monospace" }}>POST</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.6', fontFamily: "'Courier New', monospace" }}>
                    <li>/surveys</li>
                    <li>/surveys/:id/vote</li>
                    <li>/surveys/:id/like</li>
                    <li>/tags</li>
                    <li>/api/upload/image</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#1f2937', fontFamily: "'Courier New', monospace" }}>PUT/PATCH</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.6', fontFamily: "'Courier New', monospace" }}>
                    <li>/api/user/profile</li>
                    <li>/surveys/:id</li>
                    <li>/api/tags/:id</li>
                    <li>/settings/:key</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#1f2937', fontFamily: "'Courier New', monospace" }}>DELETE</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.6', fontFamily: "'Courier New', monospace" }}>
                    <li>/api/surveys/:id</li>
                    <li>/api/groups/:id</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {architectureTab === 'webapp-ui' && (
          <div style={{ padding: '2rem 0' }}>
            {/* Diagramma navigazione - Stile minimal */}
            <div 
              data-diagram="webapp-ui"
              onClick={() => setEnlargedDiagram('webapp-ui')}
              style={{
                background: '#ffffff',
                borderRadius: '4px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease',
                display: 'flex',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg viewBox="0 0 1000 600" style={{ width: '100%', maxWidth: '900px', height: 'auto' }} onClick={(e) => e.stopPropagation()}>
                {/* Home - Centro */}
                <g>
                  <rect x="425" y="50" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="500" y="85" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="600">Home</text>
                  <circle cx="575" cy="80" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="575" y="85" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">1</text>
                </g>
                
                {/* Survey List */}
                <g>
                  <rect x="425" y="170" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="500" y="200" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Survey List</text>
                  <circle cx="575" cy="200" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="575" y="205" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">2</text>
                </g>
                <path d="M 500 110 L 500 170" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowUI)"/>
                
                {/* Survey Detail */}
                <g>
                  <rect x="250" y="290" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="325" y="315" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Survey Detail</text>
                  <text x="325" y="335" textAnchor="middle" fill="#6b7280" fontSize="11">(Participate)</text>
                  <circle cx="400" cy="320" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="400" y="325" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">3</text>
                </g>
                <path d="M 475 230 L 375 290" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowUI)"/>
                
                {/* Survey Results */}
                <g>
                  <rect x="425" y="290" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="500" y="315" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Survey Results</text>
                  <text x="500" y="335" textAnchor="middle" fill="#6b7280" fontSize="11">(View Results)</text>
                  <circle cx="575" cy="320" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="575" y="325" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">4</text>
                </g>
                <path d="M 500 230 L 500 290" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowUI)"/>
                
                {/* Survey Stats */}
                <g>
                  <rect x="600" y="290" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="675" y="315" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Survey Stats</text>
                  <text x="675" y="335" textAnchor="middle" fill="#6b7280" fontSize="11">(Analytics)</text>
                  <circle cx="750" cy="320" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="750" y="325" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">5</text>
                </g>
                <path d="M 525 230 L 625 290" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowUI)"/>
                
                {/* Create Survey */}
                <g>
                  <rect x="650" y="170" width="150" height="60" rx="4" fill="#f9fafb" stroke="#4b5563" strokeWidth="2"/>
                  <text x="725" y="195" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Create Survey</text>
                  <text x="725" y="215" textAnchor="middle" fill="#6b7280" fontSize="10">🔒 Pollster</text>
                  <circle cx="800" cy="200" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="800" y="205" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">6</text>
                </g>
                <path d="M 575 80 L 725 170" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5" markerEnd="url(#arrowUI)"/>
                
                {/* Profile */}
                <g>
                  <rect x="200" y="50" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="275" y="85" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">User Profile</text>
                  <circle cx="350" cy="80" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="350" y="85" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">7</text>
                </g>
                <path d="M 425 80 L 350 80" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowUI)"/>
                
                {/* Settings */}
                <g>
                  <rect x="50" y="50" width="120" height="60" rx="4" fill="#f9fafb" stroke="#4b5563" strokeWidth="2"/>
                  <text x="110" y="75" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Settings</text>
                  <text x="110" y="95" textAnchor="middle" fill="#6b7280" fontSize="10">🔒 Admin</text>
                  <circle cx="170" cy="80" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="170" y="85" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">8</text>
                </g>
                <path d="M 275 65 L 170 70" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5" markerEnd="url(#arrowUI)"/>
                
                {/* News */}
                <g>
                  <rect x="50" y="140" width="120" height="60" rx="4" fill="#f9fafb" stroke="#4b5563" strokeWidth="2"/>
                  <text x="110" y="165" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">News</text>
                  <text x="110" y="185" textAnchor="middle" fill="#6b7280" fontSize="10">🔒 Editor</text>
                  <circle cx="170" cy="170" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="170" y="175" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">9</text>
                </g>
                <path d="M 425 90 L 170 160" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5" markerEnd="url(#arrowUI)"/>
                
                {/* Map */}
                <g>
                  <rect x="50" y="230" width="120" height="60" rx="4" fill="#f9fafb" stroke="#4b5563" strokeWidth="2"/>
                  <text x="110" y="255" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Map</text>
                  <text x="110" y="275" textAnchor="middle" fill="#6b7280" fontSize="10">🔒 Editor</text>
                  <circle cx="170" cy="260" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="170" y="265" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">10</text>
                </g>
                <path d="M 425 100 L 170 250" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5" markerEnd="url(#arrowUI)"/>
                
                {/* Information */}
                <g>
                  <rect x="650" y="50" width="150" height="60" rx="4" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <text x="725" y="85" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="600">Information</text>
                  <circle cx="800" cy="80" r="10" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="800" y="85" textAnchor="middle" fill="#4b5563" fontSize="10" fontWeight="bold">11</text>
                </g>
                <path d="M 575 80 L 650 80" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowUI)"/>
                
                {/* Legend - Stile minimal */}
                <g transform="translate(50, 420)">
                  <rect width="900" height="140" rx="4" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1"/>
                  <text x="20" y="30" fill="#111827" fontSize="16" fontWeight="600">Legenda:</text>
                  
                  <line x1="20" y1="55" x2="70" y2="55" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="80" y="60" fill="#374151" fontSize="13">Navigazione diretta</text>
                  
                  <line x1="250" y1="55" x2="300" y2="55" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5"/>
                  <text x="310" y="60" fill="#374151" fontSize="13">Navigazione protetta (richiede ruolo)</text>
                  
                  <circle cx="590" cy="55" r="8" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5"/>
                  <text x="605" y="60" fill="#374151" fontSize="13">Numero pagina</text>
                  
                  <text x="20" y="90" fill="#6b7280" fontSize="12">🔒 Admin = Solo amministratori</text>
                  <text x="240" y="90" fill="#6b7280" fontSize="12">🔒 Pollster = Creatori sondaggi</text>
                  <text x="460" y="90" fill="#6b7280" fontSize="12">🔒 Editor = Editori contenuti</text>
                  
                  <text x="20" y="120" fill="#9ca3af" fontSize="11">
                    Tutte le pagine sono accessibili dalla barra di navigazione principale
                  </text>
                </g>
                
                {/* Arrow marker */}
                <defs>
                  <marker id="arrowUI" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#4b5563" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Descrizione pagine - Stile minimal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              {[
                { name: 'Home', desc: 'Dashboard principale con overview e statistiche' },
                { name: 'Survey List', desc: 'Lista sondaggi con filtri (tipo, stato, tag)' },
                { name: 'Survey Detail', desc: 'Pagina partecipazione al sondaggio' },
                { name: 'Survey Results', desc: 'Visualizzazione risultati e analytics' },
                { name: 'Survey Stats', desc: 'Statistiche dettagliate e grafici temporali' },
                { name: 'Create Survey', desc: 'Form creazione nuovo sondaggio (Pollster)' },
                { name: 'User Profile', desc: 'Profilo utente e preferenze personali' },
                { name: 'Settings', desc: 'Impostazioni sistema e gestione utenti (Admin)' },
                { name: 'News', desc: 'Gestione notizie e contenuti (Editor)' },
                { name: 'Map', desc: 'Visualizzazione mappa interattiva (Editor)' },
                { name: 'Information', desc: 'Informazioni su piattaforma e architettura' }
              ].map((page, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1.5px solid #4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4b5563',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                      {page.name}
                    </h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', color: '#6b7280' }}>
                    {page.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stack tecnologico UI - Stile minimal */}
            <div style={{
              marginTop: '2rem',
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                Stack Tecnologico UI
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <strong style={{ color: '#111827' }}>Core</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.8', color: '#6b7280' }}>
                    <li>→ React 18</li>
                    <li>→ TypeScript</li>
                    <li>→ React Router v6</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#111827' }}>UI/UX</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.8', color: '#6b7280' }}>
                    <li>→ Lucide Icons</li>
                    <li>→ CSS Modules</li>
                    <li>→ Responsive Design</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#111827' }}>Data Viz</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.8', color: '#6b7280' }}>
                    <li>→ Recharts</li>
                    <li>→ Custom SVG Charts</li>
                    <li>→ D3.js utilities</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#111827' }}>Features</strong>
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', lineHeight: '1.8', color: '#6b7280' }}>
                    <li>→ Role-based routes</li>
                    <li>→ Protected components</li>
                    <li>→ Dynamic forms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {architectureTab === 'database' && (
          <div style={{ padding: '2rem 0' }}>
            {/* ER Diagram - Stile minimal */}
            <div 
              data-diagram="database-er"
              onClick={() => setEnlargedDiagram('database-er')}
              style={{
                background: '#ffffff',
                borderRadius: '4px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease',
                display: 'flex',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg viewBox="0 0 1200 900" style={{ width: '100%', maxWidth: '1000px', height: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <defs>
                  {/* Arrow marker per relazioni */}
                  <marker id="arrowER" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M 0 0 L 10 3 L 0 6 Z" fill="#4b5563"/>
                  </marker>
                </defs>
                
                {/* USER - Entità centrale */}
                <g>
                  <rect x="500" y="40" width="200" height="110" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="500" y="40" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="600" y="62" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="bold">USER</text>
                  <line x1="500" y1="70" x2="700" y2="70" stroke="#4b5563" strokeWidth="1"/>
                  <text x="510" y="88" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="510" y="105" fill="#6b7280" fontSize="10">name, email, user_role</text>
                  <text x="510" y="120" fill="#6b7280" fontSize="10">profile_photo, ...</text>
                </g>

                {/* SURVEYS - Entità principale */}
                <g>
                  <rect x="500" y="230" width="200" height="130" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="500" y="230" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="600" y="252" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="bold">SURVEYS</text>
                  <line x1="500" y1="260" x2="700" y2="260" stroke="#4b5563" strokeWidth="1"/>
                  <text x="510" y="278" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="510" y="293" fill="#ef4444" fontSize="11" fontWeight="bold">FK: user_id</text>
                  <text x="510" y="308" fill="#6b7280" fontSize="10">title, description</text>
                  <text x="510" y="323" fill="#6b7280" fontSize="10">question_type, is_anonymous</text>
                  <text x="510" y="338" fill="#6b7280" fontSize="10">resource_type, closure_type</text>
                </g>
                
                {/* Relazione USER -> SURVEYS (1:N) */}
                <line x1="600" y1="150" x2="600" y2="230" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowER)"/>
                <text x="615" y="190" fill="#6b7280" fontSize="12">1</text>
                <text x="615" y="220" fill="#6b7280" fontSize="12">N</text>
                <text x="620" y="195" fill="#4b5563" fontSize="11">creates</text>

                {/* SURVEY_OPTIONS */}
                <g>
                  <rect x="800" y="240" width="200" height="100" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="800" y="240" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="900" y="262" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">SURVEY_OPTIONS</text>
                  <line x1="800" y1="270" x2="1000" y2="270" stroke="#4b5563" strokeWidth="1"/>
                  <text x="810" y="288" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="810" y="303" fill="#ef4444" fontSize="11" fontWeight="bold">FK: survey_id</text>
                  <text x="810" y="318" fill="#6b7280" fontSize="10">option_text, option_order</text>
                </g>
                
                {/* Relazione SURVEYS -> SURVEY_OPTIONS (1:N) */}
                <line x1="700" y1="290" x2="800" y2="290" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowER)"/>
                <text x="710" y="285" fill="#6b7280" fontSize="11">1</text>
                <text x="785" y="285" fill="#6b7280" fontSize="11">N</text>

                {/* VOTES */}
                <g>
                  <rect x="800" y="410" width="200" height="115" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="800" y="410" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="900" y="432" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">VOTES</text>
                  <line x1="800" y1="440" x2="1000" y2="440" stroke="#4b5563" strokeWidth="1"/>
                  <text x="810" y="458" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="810" y="473" fill="#ef4444" fontSize="11" fontWeight="bold">FK: survey_id, option_id</text>
                  <text x="810" y="488" fill="#6b7280" fontSize="10">numeric_value, date_value</text>
                  <text x="810" y="503" fill="#6b7280" fontSize="10">user_id, voter_session</text>
                </g>
                
                {/* Relazioni SURVEYS -> VOTES e OPTIONS -> VOTES */}
                <line x1="650" y1="360" x2="800" y2="460" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrowER)"/>
                <text x="720" y="410" fill="#6b7280" fontSize="11">1:N</text>
                <line x1="900" y1="340" x2="900" y2="410" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowER)"/>
                <text x="910" y="375" fill="#6b7280" fontSize="11">1:N</text>

                {/* OPEN_RESPONSES */}
                <g>
                  <rect x="500" y="450" width="200" height="100" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="500" y="450" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="600" y="472" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">OPEN_RESPONSES</text>
                  <line x1="500" y1="480" x2="700" y2="480" stroke="#4b5563" strokeWidth="1"/>
                  <text x="510" y="498" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="510" y="513" fill="#ef4444" fontSize="11" fontWeight="bold">FK: survey_id</text>
                  <text x="510" y="528" fill="#6b7280" fontSize="10">response_text, user_id</text>
                </g>
                
                {/* Relazione SURVEYS -> OPEN_RESPONSES (1:N) */}
                <line x1="600" y1="360" x2="600" y2="450" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowER)"/>
                <text x="610" y="405" fill="#6b7280" fontSize="11">1:N</text>

                {/* SURVEY_LIKES */}
                <g>
                  <rect x="250" y="450" width="200" height="100" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="250" y="450" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="350" y="472" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">SURVEY_LIKES</text>
                  <line x1="250" y1="480" x2="450" y2="480" stroke="#4b5563" strokeWidth="1"/>
                  <text x="260" y="498" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="260" y="513" fill="#ef4444" fontSize="11" fontWeight="bold">FK: survey_id, user_id</text>
                  <text x="260" y="528" fill="#6b7280" fontSize="10">rating (1-5), comment</text>
                </g>
                
                {/* Relazione SURVEYS -> SURVEY_LIKES (1:N) */}
                <line x1="540" y1="360" x2="400" y2="450" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrowER)"/>
                <text x="450" y="405" fill="#6b7280" fontSize="11">1:N</text>

                {/* TAGS */}
                <g>
                  <rect x="200" y="250" width="200" height="90" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="200" y="250" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="300" y="272" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">TAGS</text>
                  <line x1="200" y1="280" x2="400" y2="280" stroke="#4b5563" strokeWidth="1"/>
                  <text x="210" y="298" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="210" y="313" fill="#6b7280" fontSize="10">name, color, is_active</text>
                </g>

                {/* SURVEY_TAGS (tabella associativa M:N) */}
                <g>
                  <rect x="350" y="320" width="100" height="60" fill="#f9fafb" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4,2"/>
                  <text x="400" y="345" textAnchor="middle" fill="#111827" fontSize="11" fontWeight="bold">SURVEY_TAGS</text>
                  <text x="400" y="363" textAnchor="middle" fill="#6b7280" fontSize="9">survey_id, tag_id</text>
                </g>
                
                {/* Relazioni M:N tramite tabella associativa */}
                <line x1="350" y1="295" x2="370" y2="320" stroke="#4b5563" strokeWidth="1.5"/>
                <line x1="450" y1="320" x2="500" y2="295" stroke="#4b5563" strokeWidth="1.5"/>
                <text x="310" y="310" fill="#6b7280" fontSize="10">M</text>
                <text x="490" y="310" fill="#6b7280" fontSize="10">N</text>

                {/* NEWS */}
                <g>
                  <rect x="820" y="40" width="180" height="100" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="820" y="40" width="180" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="910" y="62" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">NEWS</text>
                  <line x1="820" y1="70" x2="1000" y2="70" stroke="#4b5563" strokeWidth="1"/>
                  <text x="830" y="88" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="830" y="103" fill="#6b7280" fontSize="10">title, content, author</text>
                  <text x="830" y="118" fill="#6b7280" fontSize="10">image, url, published_at</text>
                </g>
                
                {/* Relazione opzionale SURVEYS -> NEWS */}
                <line x1="700" y1="260" x2="820" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5"/>
                <text x="750" y="180" fill="#6b7280" fontSize="10">0..1</text>

                {/* GROUPS */}
                <g>
                  <rect x="200" y="40" width="200" height="90" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="200" y="40" width="200" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="300" y="62" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold">GROUPS</text>
                  <line x1="200" y1="70" x2="400" y2="70" stroke="#4b5563" strokeWidth="1"/>
                  <text x="210" y="88" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="210" y="103" fill="#6b7280" fontSize="10">name, description</text>
                </g>

                {/* USER_GROUPS (tabella associativa M:N) */}
                <g>
                  <rect x="400" y="70" width="100" height="60" fill="#f9fafb" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4,2"/>
                  <text x="450" y="95" textAnchor="middle" fill="#111827" fontSize="11" fontWeight="bold">USER_GROUPS</text>
                  <text x="450" y="113" textAnchor="middle" fill="#6b7280" fontSize="9">user_id, group_id</text>
                </g>
                
                {/* Relazioni M:N USER-GROUPS */}
                <line x1="400" y1="85" x2="425" y2="85" stroke="#4b5563" strokeWidth="1.5"/>
                <line x1="475" y1="85" x2="500" y2="85" stroke="#4b5563" strokeWidth="1.5"/>
                <text x="370" y="80" fill="#6b7280" fontSize="10">N</text>
                <text x="510" y="80" fill="#6b7280" fontSize="10">M</text>

                {/* SETTINGS */}
                <g>
                  <rect x="50" y="620" width="180" height="80" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="50" y="620" width="180" height="30" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="140" y="642" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="bold">SETTINGS</text>
                  <line x1="50" y1="650" x2="230" y2="650" stroke="#4b5563" strokeWidth="1"/>
                  <text x="60" y="668" fill="#111827" fontSize="11" fontWeight="bold">PK: id</text>
                  <text x="60" y="683" fill="#6b7280" fontSize="10">key, value</text>
                </g>

                {/* Legenda - Stile minimal ER standard */}
                <g transform="translate(50, 750)">
                  <rect width="1100" height="110" rx="4" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1"/>
                  <text x="20" y="30" fill="#111827" fontSize="15" fontWeight="bold">Legenda Schema ER:</text>
                  
                  {/* Entità standard */}
                  <rect x="20" y="45" width="70" height="35" fill="#ffffff" stroke="#4b5563" strokeWidth="2"/>
                  <rect x="20" y="45" width="70" height="15" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2"/>
                  <text x="100" y="65" fill="#374151" fontSize="12">Entità (Tabella)</text>
                  
                  {/* Tabella associativa */}
                  <rect x="230" y="50" width="70" height="25" fill="#f9fafb" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4,2"/>
                  <text x="310" y="65" fill="#374151" fontSize="12">Tabella associativa M:N</text>
                  
                  {/* Relazione 1:N */}
                  <line x1="520" y1="60" x2="570" y2="60" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrowER)"/>
                  <text x="580" y="65" fill="#374151" fontSize="12">Relazione 1:N</text>
                  
                  {/* Relazione opzionale */}
                  <line x1="740" y1="60" x2="790" y2="60" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,5"/>
                  <text x="800" y="65" fill="#374151" fontSize="12">Relazione opzionale (0..1)</text>
                  
                  {/* Info chiavi e note */}
                  <text x="20" y="95" fill="#111827" fontSize="11" fontWeight="bold">PK</text>
                  <text x="40" y="95" fill="#6b7280" fontSize="11">= Primary Key</text>
                  
                  <text x="170" y="95" fill="#ef4444" fontSize="11" fontWeight="bold">FK</text>
                  <text x="190" y="95" fill="#6b7280" fontSize="11">= Foreign Key</text>
                  
                  <text x="320" y="95" fill="#6b7280" fontSize="11">• 12 Tabelle</text>
                  <text x="430" y="95" fill="#6b7280" fontSize="11">• 2 Tabelle associative M:N</text>
                  <text x="630" y="95" fill="#6b7280" fontSize="11">• Campi JSONB per metadata</text>
                </g>
              </svg>
            </div>

            {/* Tabelle dettagliate - Stile minimal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              {[
                { name: 'user', desc: 'Utenti con ruoli (admin, pollster, editor, user)', fields: 15 },
                { name: 'surveys', desc: 'Sondaggi con tipi domanda, chiusura, risorse', fields: 17 },
                { name: 'survey_options', desc: 'Opzioni di risposta per ogni sondaggio', fields: 6 },
                { name: 'votes', desc: 'Voti con supporto numerico/data/opzioni', fields: 8 },
                { name: 'open_responses', desc: 'Risposte aperte testuali', fields: 7 },
                { name: 'survey_likes', desc: 'Valutazioni e commenti sui sondaggi', fields: 7 },
                { name: 'tags', desc: 'Tag per categorizzazione sondaggi', fields: 6 },
                { name: 'survey_tags', desc: 'Associazione sondaggi-tag (M:N)', fields: 3 },
                { name: 'news', desc: 'Notizie con metadati JSONB', fields: 32 },
                { name: 'groups', desc: 'Gruppi di utenti', fields: 5 },
                { name: 'user_groups', desc: 'Associazione utenti-gruppi (M:N)', fields: 3 },
                { name: 'settings', desc: 'Impostazioni chiave-valore', fields: 4 }
              ].map((table, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                      {table.name}
                    </h5>
                    <span style={{ fontSize: '0.75rem', background: '#f3f4f6', color: '#4b5563', padding: '0.25rem 0.5rem', borderRadius: '3px', border: '1px solid #d1d5db' }}>
                      {table.fields} fields
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', color: '#6b7280' }}>
                    {table.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Caratteristiche tecniche - Stile minimal */}
            <div style={{
              marginTop: '2rem',
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                Caratteristiche Database
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                <div>
                  <h5 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>Normalizzazione</h5>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#6b7280', margin: 0 }}>
                    Schema in 3NF con tabelle associative per relazioni M:N. Foreign keys con CASCADE/SET NULL per integrità referenziale.
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>Performance</h5>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#6b7280', margin: 0 }}>
                    45+ indici B-tree e GIN per query ottimizzate. Indici su FK, timestamp, campi JSONB. Partitioning-ready per scalabilità.
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>Flessibilità</h5>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#6b7280', margin: 0 }}>
                    JSONB per metadati semi-strutturati (news, categorie). ENUM types per vincoli. Nullable FK per supporto anonimo.
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>Compatibilità</h5>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#6b7280', margin: 0 }}>
                    100% PostgreSQL-compatible. Deploy su PostgreSQL locale o Databricks Lakebase (port 5432) con stessa sintassi SQL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {architectureTab === 'deployment' && (
          <div style={{ padding: '2rem 0' }}>
            <p style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              L'applicazione supporta tre modalità di deployment per adattarsi a diverse esigenze: sviluppo locale, hybrid cloud, e full cloud su Databricks.
            </p>

            {/* Deployment diagrams */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Modalità 1: Full Local */}
              <div 
                onClick={() => setEnlargedDiagram('deploy-local')}
                style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '2rem',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <h4 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: '#10b981',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>1</span>
                  Deployment Locale (Dev & Testing)
                </h4>
                <svg data-diagram="deploy-local" viewBox="0 0 900 250" style={{ width: '100%', height: 'auto' }}>
                  <rect x="50" y="50" width="200" height="150" rx="8" fill="#f8fafc" opacity="0.95"/>
                  <text x="150" y="85" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="bold">Laptop / Desktop</text>
                  
                  <rect x="70" y="100" width="160" height="40" rx="4" fill="#61dafb" opacity="0.9"/>
                  <text x="150" y="125" textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold">React Frontend</text>
                  <text x="230" y="125" fill="#0f172a" fontSize="12">:3000</text>
                  
                  <rect x="70" y="150" width="160" height="40" rx="4" fill="#009688" opacity="0.9"/>
                  <text x="150" y="175" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">FastAPI Backend</text>
                  <text x="230" y="175" fill="#0f172a" fontSize="12">:8000</text>
                  
                  <rect x="300" y="50" width="550" height="150" rx="8" fill="#f8fafc" opacity="0.95"/>
                  <text x="575" y="85" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="bold">Docker Container</text>
                  
                  <rect x="320" y="100" width="240" height="90" rx="4" fill="#336791" opacity="0.9"/>
                  <text x="440" y="135" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">PostgreSQL</text>
                  <text x="440" y="160" textAnchor="middle" fill="#fff" fontSize="12">Database locale</text>
                  <text x="440" y="180" textAnchor="middle" fill="#fff" fontSize="12">Port: 5433</text>
                  
                  <rect x="590" y="100" width="240" height="90" rx="4" fill="#1e293b" opacity="0.8"/>
                  <text x="710" y="135" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">Docker Compose</text>
                  <text x="710" y="155" textAnchor="middle" fill="#fff" fontSize="11">• Auto-start container</text>
                  <text x="710" y="175" textAnchor="middle" fill="#fff" fontSize="11">• Volume persistence</text>
                  
                  <path d="M 230 120 L 320 145" stroke="#0f172a" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowDark)"/>
                  <path d="M 230 170 L 320 145" stroke="#0f172a" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowDark)"/>
                  
                  <defs>
                    <marker id="arrowDark" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#0f172a" />
                    </marker>
                  </defs>
                </svg>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>
                    <strong style={{ color: '#1e293b' }}>✓ Ideale per:</strong> Sviluppo locale, testing, demo offline • <strong style={{ color: '#1e293b' }}>Setup:</strong> <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '3px', color: '#0f172a' }}>docker-compose up</code> • <strong style={{ color: '#1e293b' }}>Costi:</strong> $0 (tutto locale)
                  </p>
                </div>
              </div>

              {/* Modalità 2: Hybrid */}
              <div 
                onClick={() => setEnlargedDiagram('deploy-hybrid')}
                style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '2rem',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <h4 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: '#3b82f6',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>2</span>
                  Deployment Hybrid (App Locale + Database Cloud)
                </h4>
                <svg data-diagram="deploy-hybrid" viewBox="0 0 1000 250" style={{ width: '100%', height: 'auto' }}>
                  <rect x="50" y="50" width="320" height="150" rx="8" fill="#f8fafc" opacity="0.95"/>
                  <text x="210" y="85" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="bold">Laptop / Server Locale</text>
                  
                  <rect x="70" y="100" width="130" height="40" rx="4" fill="#61dafb" opacity="0.9"/>
                  <text x="135" y="125" textAnchor="middle" fill="#000" fontSize="13" fontWeight="bold">React</text>
                  
                  <rect x="220" y="100" width="130" height="40" rx="4" fill="#009688" opacity="0.9"/>
                  <text x="285" y="125" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">FastAPI</text>
                  
                  <rect x="70" y="150" width="280" height="40" rx="4" fill="#f59e0b" opacity="0.8"/>
                  <text x="210" y="175" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">lakebase_connector.py</text>
                  
                  <path d="M 200 120 L 250 120" stroke="#0f172a" strokeWidth="2" markerEnd="url(#arrowDark)"/>
                  
                  <text x="500" y="135" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">HTTPS / Port 5432</text>
                  <path d="M 370 170 L 630 170" stroke="#1e293b" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrowDark2)"/>
                  
                  <rect x="630" y="50" width="320" height="150" rx="8" fill="#fb923c" opacity="0.15" stroke="#fb923c" strokeWidth="3"/>
                  <text x="790" y="80" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="bold">Databricks Cloud</text>
                  
                  <rect x="660" y="100" width="260" height="90" rx="4" fill="#fb923c" opacity="0.9"/>
                  <text x="790" y="130" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">Lakebase</text>
                  <text x="790" y="150" textAnchor="middle" fill="#fff" fontSize="12">PostgreSQL-compatible</text>
                  <text x="790" y="170" textAnchor="middle" fill="#fff" fontSize="12">Port: 5432</text>
                  
                  <defs>
                    <marker id="arrowDark2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#1e293b" />
                    </marker>
                  </defs>
                </svg>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>
                    <strong style={{ color: '#1e293b' }}>✓ Ideale per:</strong> Staging, produzione con controllo frontend/backend • <strong style={{ color: '#1e293b' }}>Setup:</strong> Config Lakebase credentials • <strong style={{ color: '#1e293b' }}>Costi:</strong> Lakebase compute units (pay-per-use)
                  </p>
                </div>
              </div>

              {/* Modalità 3: Full Databricks */}
              <div 
                onClick={() => setEnlargedDiagram('deploy-full')}
                style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '2rem',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <h4 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: '#f97316',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>3</span>
                  Deployment Full Cloud (Databricks Apps + Lakebase)
                </h4>
                <svg data-diagram="deploy-full" viewBox="0 0 950 280" style={{ width: '100%', height: 'auto' }}>
                  <rect x="50" y="30" width="850" height="220" rx="8" fill="#1e293b" opacity="0.1" stroke="#fb923c" strokeWidth="4"/>
                  <text x="475" y="65" textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="bold">Databricks Platform (Cloud)</text>
                  
                  <rect x="100" y="90" width="250" height="140" rx="6" fill="#fdba74" opacity="0.9"/>
                  <text x="225" y="120" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">Databricks Apps</text>
                  
                  <rect x="120" y="135" width="90" height="35" rx="4" fill="#61dafb" opacity="0.95"/>
                  <text x="165" y="157" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">React</text>
                  
                  <rect x="220" y="135" width="90" height="35" rx="4" fill="#009688" opacity="0.95"/>
                  <text x="265" y="157" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">FastAPI</text>
                  
                  <text x="225" y="195" textAnchor="middle" fill="#1e293b" fontSize="11">Gestito automaticamente</text>
                  <text x="225" y="215" textAnchor="middle" fill="#1e293b" fontSize="11">Scaling & HA inclusi</text>
                  
                  <rect x="420" y="90" width="450" height="140" rx="6" fill="#fb923c" opacity="0.9"/>
                  <text x="645" y="120" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">Lakebase (Database)</text>
                  
                  <rect x="450" y="140" width="180" height="70" rx="4" fill="#336791" opacity="0.95"/>
                  <text x="540" y="165" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">PostgreSQL Engine</text>
                  <text x="540" y="185" textAnchor="middle" fill="#fff" fontSize="11">Port: 5432</text>
                  <text x="540" y="200" textAnchor="middle" fill="#fff" fontSize="11">ACID Transactions</text>
                  
                  <rect x="660" y="140" width="180" height="70" rx="4" fill="#1e293b" opacity="0.8"/>
                  <text x="750" y="160" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Unity Catalog</text>
                  <text x="750" y="178" textAnchor="middle" fill="#fff" fontSize="10">• Governance</text>
                  <text x="750" y="193" textAnchor="middle" fill="#fff" fontSize="10">• Access Control</text>
                  <text x="750" y="208" textAnchor="middle" fill="#fff" fontSize="10">• Audit Logs</text>
                  
                  <path d="M 350 157 L 450 175" stroke="#1e293b" strokeWidth="3" markerEnd="url(#arrowDark3)"/>
                  <text x="390" y="160" fill="#1e293b" fontSize="12" fontWeight="bold">SQL</text>
                  
                  <defs>
                    <marker id="arrowDark3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#1e293b" />
                    </marker>
                  </defs>
                </svg>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>
                    <strong style={{ color: '#1e293b' }}>✓ Ideale per:</strong> Produzione enterprise, high availability, auto-scaling • <strong style={{ color: '#1e293b' }}>Setup:</strong> Deploy su Databricks workspace • <strong style={{ color: '#1e293b' }}>Costi:</strong> Apps + Lakebase compute (managed infrastructure)
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div style={{
              marginTop: '3rem',
              background: 'var(--card-bg)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              overflow: 'auto'
            }}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                Confronto Modalità di Deployment
              </h4>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Caratteristica</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#10b981' }}>Locale</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>Hybrid</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#ff4500' }}>Full Cloud</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-secondary)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>Complessità Setup</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>⭐ Bassa</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>⭐⭐ Media</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>⭐ Bassa</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>Costo Operativo</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>$0</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>$ (DB only)</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>$$ (Full managed)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>Scalabilità</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Limitata</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Media (DB)</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓ Auto-scaling</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>High Availability</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>✗ No</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓ DB (99.9%)</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓✓ Full (99.95%)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>Manutenzione</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Manuale</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Parziale (DB auto)</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓ Automatica</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>Use Case Ideale</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Dev/Test</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Staging/Small Prod</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>Enterprise Prod</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Scripts e comandi */}
            <div style={{
              marginTop: '2rem',
              background: '#1e293b',
              padding: '1.5rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                Comandi Quick Start
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <h5 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>1. Locale:</h5>
                  <code style={{ display: 'block', background: '#0f172a', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8125rem', fontFamily: 'monospace', overflow: 'auto' }}>
                    ./scripts/deploy_local.sh
                  </code>
                </div>
                <div>
                  <h5 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>2. Hybrid:</h5>
                  <code style={{ display: 'block', background: '#0f172a', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8125rem', fontFamily: 'monospace', overflow: 'auto' }}>
                    ./scripts/deploy_hybrid.sh
                  </code>
                </div>
                <div>
                  <h5 style={{ color: '#ff4500', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>3. Full Cloud:</h5>
                  <code style={{ display: 'block', background: '#0f172a', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8125rem', fontFamily: 'monospace', overflow: 'auto' }}>
                    ./scripts/deploy_databricks.sh
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        );

      case 'contacts':
        return (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Users size={32} style={{ color: '#6366f1' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Contatti</h2>
            </div>
            
            <div style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <p>
                Per qualsiasi domanda, suggerimento o segnalazione, puoi contattarci attraverso i seguenti canali:
              </p>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  📧 Email
                </h3>
                <p>
                  <a href="mailto:support@webdemocracy.it" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    support@webdemocracy.it
                  </a>
                </p>
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  🏢 Ufficio
                </h3>
                <p>
                  Via della Repubblica, 123<br />
                  20100 Milano (MI)<br />
                  Italia
                </p>
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  ⏰ Orari di supporto
                </h3>
                <p>
                  Lunedì - Venerdì: 9:00 - 18:00<br />
                  Sabato - Domenica: Chiuso
                </p>
              </div>

              <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>
                Ci impegniamo a rispondere a tutte le richieste entro 24-48 ore lavorative.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarLayout sidebar={sidebar} sidebarPosition="left">
      {renderContent()}
      
      {/* Modal per diagrammi ingranditi */}
      {enlargedDiagram && (
        <div
          onClick={() => setEnlargedDiagram(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '2rem',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div style={{ position: 'relative', width: '95vw', height: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              style={{ 
                background: '#ffffff', 
                borderRadius: '8px', 
                padding: '2rem',
                maxWidth: '100%',
                maxHeight: '100%',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe 
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                      svg { max-width: 100%; height: auto; }
                    </style>
                  </head>
                  <body>
                    ${enlargedDiagram === 'webapp-arch' ? document.querySelector('[data-diagram="webapp-arch"] svg')?.outerHTML || '' : ''}
                    ${enlargedDiagram === 'webapp-ui' ? document.querySelector('[data-diagram="webapp-ui"] svg')?.outerHTML || '' : ''}
                    ${enlargedDiagram === 'database-er' ? document.querySelector('[data-diagram="database-er"] svg')?.outerHTML || '' : ''}
                    ${enlargedDiagram === 'deploy-local' ? document.querySelector('[data-diagram="deploy-local"] svg')?.outerHTML || '' : ''}
                    ${enlargedDiagram === 'deploy-hybrid' ? document.querySelector('[data-diagram="deploy-hybrid"] svg')?.outerHTML || '' : ''}
                    ${enlargedDiagram === 'deploy-full' ? document.querySelector('[data-diagram="deploy-full"] svg')?.outerHTML || '' : ''}
                  </body>
                  </html>
                `}
                style={{ 
                  width: '90vw', 
                  height: '85vh', 
                  border: 'none',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); setEnlargedDiagram(null); }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#333',
                zIndex: 10001
              }}
            >
              ×
            </button>
            <p style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              opacity: 0.9,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              Clicca ovunque per chiudere
            </p>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default Information;

