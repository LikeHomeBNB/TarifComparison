import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Plus, Download, Info, Check, X } from 'lucide-react';

// LikeHome Farbpalette als CSS Variablen
const style = `
  :root {
    --forest-green: #1B2C22;
    --sage-green: #95A292;
    --charcoal: #151515;
    --light-gray: #F6F6F6;
    --white: #FFFFFF;
  }
  
  @media print {
    body * {
      visibility: hidden;
    }
    
    .print-area, .print-area * {
      visibility: visible;
    }
    
    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    
    .no-print {
      display: none !important;
    }
    
    .print-header {
      display: block !important;
      margin-bottom: 20px;
      padding: 20px;
      background: #1B2C22 !important;
      color: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    table {
      page-break-inside: avoid;
    }
    
    .tooltip {
      display: none !important;
    }
  }
`;

const TariffComparison = () => {
  // State Definitionen - saubere Reihenfolge
  const [projectInfo, setProjectInfo] = useState({
    property: '',
    serviceType: 'strom',
    heatingType: 'gas',
    apartmentCount: 1,
    date: new Date().toISOString().split('T')[0],
    processor: ''
  });

  const [providers, setProviders] = useState([
    { 
      name: 'SimplyGreen', 
      contract: false, 
      price1: 79.35, 
      price2: 81.22, 
      rating: 4.3, 
      size: 665,
      speed: 0,
      stability: '',
      scores: { contract: 0, price1: 10, price2: 10, rating: 8.6, size: 4, speed: 0, stability: 0 }
    },
    { 
      name: '1•2•3 energie', 
      contract: false, 
      price1: 85.51, 
      price2: 87.18, 
      rating: 4.2, 
      size: 687,
      speed: 0,
      stability: '',
      scores: { contract: 0, price1: 8, price2: 8, rating: 8.4, size: 4, speed: 0, stability: 0 }
    },
    { 
      name: 'E.ON', 
      contract: true, 
      price1: 85.55, 
      price2: 87.53, 
      rating: 4.1, 
      size: 7809,
      speed: 0,
      stability: '',
      scores: { contract: 10, price1: 8, price2: 8, rating: 8.2, size: 10, speed: 0, stability: 0 }
    }
  ]);

  const [totals, setTotals] = useState([]);
  const [rankings, setRankings] = useState([]);

  // Weights basierend auf Service-Typ - NACH allen State-Definitionen
  const getWeights = (serviceType) => {
    if (serviceType === 'internet') {
      return {
        contract: 0.10,
        price1: 0.35,
        price2: 0.00,
        rating: 0.20,
        size: 0.00,
        speed: 0.35,
        stability: 0.20
      };
    }
    return {
      contract: 0.15,
      price1: 0.20,
      price2: 0.20,
      rating: 0.30,
      size: 0.15,
      speed: 0.00,
      stability: 0.00
    };
  };

  const tooltips = {
    contract: {
      title: "Bereits Vertrag vorhanden",
      content: "✓ Kein Vertrag = 0 Punkte\n✓ Vertrag vorhanden = 10 Punkte\n\nBegründung: Bestehende Verträge reduzieren Verwaltungsaufwand und nutzen Synergien."
    },
    price1: {
      title: projectInfo.serviceType === 'internet' ? "Preis (€/Monat)" : "Preis Jahr 1",
      content: projectInfo.serviceType === 'internet' 
        ? "• Günstigster Preis = 10 Punkte\n• Je 2% Unterschied = -1 Punkt\n• Minimum: 1 Punkt\n\nHinweis: Immer den schnellsten verfügbaren Tarif wählen!"
        : "• Günstigster Preis = 10 Punkte\n• Je 2% Unterschied = -1 Punkt\n• Minimum: 1 Punkt\n\nBeispiel:\nGünstigster: 80€ = 10 Punkte\n81,60€ (+2%) = 9 Punkte\n83,20€ (+4%) = 8 Punkte"
    },
    price2: {
      title: "Preis Jahr 2",
      content: "• Günstigster Preis = 10 Punkte\n• Je 2% Unterschied = -1 Punkt\n• Minimum: 1 Punkt\n\nHinweis: Oft höhere Preise nach Bonuszeit im ersten Jahr."
    },
    rating: {
      title: "Bewertung/Service",
      content: "• Verivox-Bewertung × 2 = Punkte\n• Maximum: 10 Punkte (bei 5,0 Sternen)\n• Minimum: 1 Punkt\n\nBeispiel:\n4,3 Sterne × 2 = 8,6 Punkte\n3,5 Sterne × 2 = 7,0 Punkte"
    },
    size: {
      title: "Größe Anbieter",
      content: "≥5000 Bewertungen = 10 Punkte\n≥4000 Bewertungen = 9 Punkte\n≥3000 Bewertungen = 8 Punkte\n≥2000 Bewertungen = 7 Punkte\n≥1000 Bewertungen = 6 Punkte\n≥800 Bewertungen = 5 Punkte\n≥600 Bewertungen = 4 Punkte\n≥400 Bewertungen = 3 Punkte\n≥200 Bewertungen = 2 Punkte\n≥100 Bewertungen = 1 Punkt"
    },
    speed: {
      title: "Download-Geschwindigkeit",
      content: "≥1000 Mbit/s = 10 Punkte (Gigabit)\n≥500 Mbit/s = 9 Punkte\n≥250 Mbit/s = 8 Punkte\n≥100 Mbit/s = 7 Punkte (AirBnB-Minimum)\n≥50 Mbit/s = 5 Punkte\n≥25 Mbit/s = 3 Punkte\n<25 Mbit/s = 1 Punkt\n\nImmer den schnellsten verfügbaren Tarif recherchieren!"
    },
    stability: {
      title: "Technologie/Stabilität",
      content: "Glasfaser = 10 Punkte (beste Stabilität)\nKabel DOCSIS 3.1 = 8 Punkte\nKabel DOCSIS 3.0 = 6 Punkte\nVDSL = 5 Punkte\nDSL = 3 Punkte\nLTE/5G = 4 Punkte (wetterabhängig)\n\nGlasfaser ist für AirBnB optimal!"
    }
  };

  const calculateScores = () => {
    const updatedProviders = [...providers];
    const weights = getWeights(projectInfo.serviceType);

    // Contract scores
    updatedProviders.forEach(provider => {
      provider.scores.contract = provider.contract ? 10 : 0;
    });

    // Price scores (Year 1)
    const prices1 = updatedProviders.map(p => p.price1).filter(p => p > 0);
    if (prices1.length > 0) {
      const minPrice1 = Math.min(...prices1);
      updatedProviders.forEach(provider => {
        if (provider.price1 > 0) {
          const difference = ((provider.price1 - minPrice1) / minPrice1) * 100;
          provider.scores.price1 = Math.max(1, 10 - Math.floor(difference / 2));
        }
      });
    }

    // Price scores (Year 2) - nur wenn nicht Internet
    if (projectInfo.serviceType !== 'internet') {
      const prices2 = updatedProviders.map(p => p.price2).filter(p => p > 0);
      if (prices2.length > 0) {
        const minPrice2 = Math.min(...prices2);
        updatedProviders.forEach(provider => {
          if (provider.price2 > 0) {
            const difference = ((provider.price2 - minPrice2) / minPrice2) * 100;
            provider.scores.price2 = Math.max(1, 10 - Math.floor(difference / 2));
          }
        });
      }
    }

    // Rating scores
    updatedProviders.forEach(provider => {
      if (provider.rating > 0) {
        provider.scores.rating = Math.min(10, Math.max(1, provider.rating * 2));
      }
    });

    // Size scores - nur wenn nicht Internet
    if (projectInfo.serviceType !== 'internet') {
      updatedProviders.forEach(provider => {
        const reviews = provider.size;
        let points = 1;
        
        if (reviews >= 5000) points = 10;
        else if (reviews >= 4000) points = 9;
        else if (reviews >= 3000) points = 8;
        else if (reviews >= 2000) points = 7;
        else if (reviews >= 1000) points = 6;
        else if (reviews >= 800) points = 5;
        else if (reviews >= 600) points = 4;
        else if (reviews >= 400) points = 3;
        else if (reviews >= 200) points = 2;
        else if (reviews >= 100) points = 1;
        
        provider.scores.size = points;
      });
    }

    // Speed scores (nur für Internet)
    if (projectInfo.serviceType === 'internet') {
      updatedProviders.forEach(provider => {
        const speed = provider.speed || 0;
        let points = 1;
        
        if (speed >= 1000) points = 10;
        else if (speed >= 500) points = 9;
        else if (speed >= 250) points = 8;
        else if (speed >= 100) points = 7;
        else if (speed >= 50) points = 5;
        else if (speed >= 25) points = 3;
        else if (speed < 25) points = 1;
        
        provider.scores.speed = points;
      });
      
      // Stability scores (nur für Internet)
      updatedProviders.forEach(provider => {
        const tech = provider.stability || '';
        let points = 1;
        
        if (tech === 'glasfaser') points = 10;
        else if (tech === 'kabel_docsis31') points = 8;
        else if (tech === 'kabel_docsis30') points = 6;
        else if (tech === 'vdsl') points = 5;
        else if (tech === 'lte_5g') points = 4;
        else if (tech === 'dsl') points = 3;
        
        provider.scores.stability = points;
      });
    }

    // Calculate totals
    const newTotals = updatedProviders.map(provider => {
      return Object.entries(weights).reduce((sum, [key, weight]) => {
        const score = provider.scores[key] || 0;
        return sum + (score * weight);
      }, 0);
    });

    // Calculate rankings
    const providerTotals = newTotals.map((total, index) => ({ total, index }));
    providerTotals.sort((a, b) => b.total - a.total);
    const newRankings = Array(providers.length);
    providerTotals.forEach((item, rank) => {
      newRankings[item.index] = rank + 1;
    });

    setProviders(updatedProviders);
    setTotals(newTotals);
    setRankings(newRankings);
  };

  useEffect(() => {
    calculateScores();
  }, [providers, projectInfo.serviceType]);

  const updateProvider = (index, field, value) => {
    const updatedProviders = [...providers];
    if (field === 'contract') {
      updatedProviders[index][field] = value;
    } else if (field === 'stability') {
      updatedProviders[index][field] = value;
    } else {
      updatedProviders[index][field] = parseFloat(value) || 0;
    }
    setProviders(updatedProviders);
  };

  const addProvider = () => {
    setProviders([...providers, {
      name: '',
      contract: false,
      price1: 0,
      price2: 0,
      rating: 0,
      size: 0,
      speed: 0,
      stability: '',
      scores: { contract: 0, price1: 0, price2: 0, rating: 0, size: 0, speed: 0, stability: 0 }
    }]);
  };

  const removeProvider = (index) => {
    if (providers.length <= 2) {
      alert('Mindestens 2 Anbieter müssen für einen Vergleich vorhanden sein!');
      return;
    }
    const updatedProviders = providers.filter((_, i) => i !== index);
    setProviders(updatedProviders);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const Tooltip = ({ children, content, title }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="cursor-help"
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-50 w-80 p-4 text-sm text-white bg-gray-800 rounded-lg shadow-lg -right-4 top-8">
            <div className="font-semibold mb-2">{title}</div>
            <div className="whitespace-pre-line text-xs">{content}</div>
            <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -top-1 right-8"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen print-area" style={{ backgroundColor: 'var(--light-gray)' }}>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      
      {/* Print Header - nur beim Drucken sichtbar */}
      <div className="print-header hidden">
        <h1 className="text-2xl font-bold">LikeHome - Grundversorgung Tarif-Vergleich</h1>
        <div className="mt-2 text-sm">
          <p>Objekt: {projectInfo.property || 'Unbenannt'}</p>
          <p>Service: {projectInfo.serviceType.toUpperCase()}{projectInfo.serviceType === 'heizung' ? ` (${projectInfo.heatingType.toUpperCase()})` : ''}</p>
          <p>Datum: {projectInfo.date} | Bearbeiter: {projectInfo.processor || 'Unbekannt'}</p>
        </div>
      </div>
      
      {/* Header */}
      <div className="text-white py-12 no-print" style={{ backgroundColor: 'var(--forest-green)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-12 h-12 mr-4" />
            <h1 className="text-4xl font-light">Grundversorgung Tarif-Vergleich</h1>
          </div>
          <p className="text-center text-xl opacity-90">Automatisierte Nutzwertanalyse für optimale Anbieterauswahl</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Project Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8" style={{ borderLeft: '4px solid var(--sage-green)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--charcoal)' }}>📋 Projekt-Informationen</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--charcoal)' }}>Objekt/Immobilie</label>
              <input
                type="text"
                value={projectInfo.property}
                onChange={(e) => setProjectInfo({...projectInfo, property: e.target.value})}
                placeholder="z.B. LikeHome München Zentral"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ focusRingColor: 'var(--sage-green)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--charcoal)' }}>Versorgungsart</label>
              <select
                value={projectInfo.serviceType}
                onChange={(e) => setProjectInfo({...projectInfo, serviceType: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="strom">Strom</option>
                <option value="heizung">Heizung</option>
                <option value="internet">Internet</option>
                <option value="wasser">Wasser</option>
              </select>
            </div>
            {projectInfo.serviceType === 'heizung' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--charcoal)' }}>Art der Heizung</label>
                <select
                  value={projectInfo.heatingType}
                  onChange={(e) => setProjectInfo({...projectInfo, heatingType: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="gas">Gas</option>
                  <option value="öl">Öl</option>
                </select>
              </div>
            )}
            {projectInfo.serviceType === 'internet' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--charcoal)' }}>Anzahl Wohnungen</label>
                <input
                  type="number"
                  min="1"
                  value={projectInfo.apartmentCount}
                  onChange={(e) => setProjectInfo({...projectInfo, apartmentCount: parseInt(e.target.value) || 1})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Anzahl der Apartments"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--charcoal)' }}>Datum</label>
              <input
                type="date"
                value={projectInfo.date}
                onChange={(e) => setProjectInfo({...projectInfo, date: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--charcoal)' }}>Bearbeiter</label>
              <input
                type="text"
                value={projectInfo.processor}
                onChange={(e) => setProjectInfo({...projectInfo, processor: e.target.value})}
                placeholder="Name des Bearbeiters"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8 no-print">
          <button
            onClick={addProvider}
            className="flex items-center px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: 'var(--sage-green)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Anbieter hinzufügen
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: 'var(--forest-green)' }}
          >
            <Download className="w-5 h-5 mr-2" />
            Als PDF drucken
          </button>
        </div>

        {/* Strom-spezifische Hinweise */}
        {projectInfo.serviceType === 'strom' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 no-print">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Wichtige Hinweise für Strom-Tarife</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Keine variablen Stromverträge akzeptiert</li>
                    <li>Nur 100% Ökostrom-Tarife berücksichtigen</li>
                    <li>Besondere Berücksichtigung von Wärmepumpen-Tarifen</li>
                    <li>Solaranlagen und Einspeisung in die Bewertung einbeziehen</li>
                    <li>HT/NT-Tarife (Hochtarif/Niedertarif) prüfen falls relevant</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Internet-spezifische Hinweise */}
        {projectInfo.serviceType === 'internet' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 no-print">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Bandbreiten-Kalkulation für {projectInfo.apartmentCount} Wohnung{projectInfo.apartmentCount > 1 ? 'en' : ''}</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="font-semibold text-blue-800">📊 Mindestanforderung</div>
                      <div className="text-lg font-bold text-blue-600">{projectInfo.apartmentCount * 100} Mbit/s</div>
                      <div className="text-xs">100 Mbit/s pro Wohnung (Minimum)</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="font-semibold text-green-800">🚀 Optimal</div>
                      <div className="text-lg font-bold text-green-600">{projectInfo.apartmentCount * 250} Mbit/s</div>
                      <div className="text-xs">250 Mbit/s pro Wohnung (Ideal)</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Immer den schnellsten verfügbaren Tarif recherchieren</strong></li>
                      <li>Gaming-Gäste: Minimum 100 Mbit/s für flüssiges Spielen</li>
                      <li>4K-Streaming: 25 Mbit/s pro gleichzeitigem Stream</li>
                      <li>Business-Gäste: Upload-Speed für Videokonferenzen wichtig</li>
                      <li>Glasfaser bevorzugt für beste Stabilität und niedrige Latenz</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 text-white font-semibold" style={{ backgroundColor: 'var(--forest-green)' }}>
                    Bewertungskriterien
                  </th>
                  <th className="text-center p-4 text-white font-semibold w-20" style={{ backgroundColor: 'var(--sage-green)' }}>
                    %
                  </th>
                  {providers.map((provider, index) => (
                    <th key={index} className="text-center p-4 text-white font-semibold relative min-w-48" style={{ backgroundColor: 'var(--forest-green)' }}>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(index, 'name', e.target.value)}
                        placeholder={`Anbieter ${index + 1}`}
                        className="bg-transparent border-none text-white text-center font-semibold w-full focus:outline-none placeholder-gray-300"
                      />
                      {providers.length > 2 && (
                        <button
                          onClick={() => removeProvider(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors no-print"
                        >
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  {providers.map((_, index) => (
                    <th key={index} className="p-2">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-white p-2 rounded" style={{ backgroundColor: 'var(--sage-green)' }}>Eingabe</div>
                        <div className="text-white p-2 rounded" style={{ backgroundColor: 'var(--charcoal)' }}>Punkte</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Contract Row */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                    Bereits Vertrag vorhanden
                    <Tooltip content={tooltips.contract.content} title={tooltips.contract.title}>
                      <Info className="w-4 h-4 ml-2 text-blue-500" />
                    </Tooltip>
                  </td>
                  <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                    {projectInfo.serviceType === 'internet' ? '10%' : '15%'}
                  </td>
                  {providers.map((provider, index) => (
                    <td key={index} className="p-2">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex justify-center items-center" style={{ backgroundColor: 'var(--light-gray)' }}>
                          <input
                            type="checkbox"
                            checked={provider.contract}
                            onChange={(e) => updateProvider(index, 'contract', e.target.checked)}
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                          {provider.scores.contract}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Price Year 1 Row OR Internet Price Row */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                    {projectInfo.serviceType === 'internet' ? 'Preis (€/Monat)' : 'Preis Jahr 1 (€/Monat)'}
                    <Tooltip content={tooltips.price1.content} title={tooltips.price1.title}>
                      <Info className="w-4 h-4 ml-2 text-blue-500" />
                    </Tooltip>
                  </td>
                  <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                    {projectInfo.serviceType === 'internet' ? '35%' : '20%'}
                  </td>
                  {providers.map((provider, index) => (
                    <td key={index} className="p-2">
                      <div className="grid grid-cols-2 gap-1">
                        <div style={{ backgroundColor: 'var(--light-gray)' }}>
                          <input
                            type="number"
                            value={provider.price1 || ''}
                            onChange={(e) => updateProvider(index, 'price1', e.target.value)}
                            placeholder="€/Monat"
                            className="w-full p-2 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1"
                          />
                        </div>
                        <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                          {provider.scores.price1}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Price Year 2 Row - nur wenn nicht Internet */}
                {projectInfo.serviceType !== 'internet' && (
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                      Preis Jahr 2 (€/Monat)
                      <Tooltip content={tooltips.price2.content} title={tooltips.price2.title}>
                        <Info className="w-4 h-4 ml-2 text-blue-500" />
                      </Tooltip>
                    </td>
                    <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>20%</td>
                    {providers.map((provider, index) => (
                      <td key={index} className="p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div style={{ backgroundColor: 'var(--light-gray)' }}>
                            <input
                              type="number"
                              value={provider.price2 || ''}
                              onChange={(e) => updateProvider(index, 'price2', e.target.value)}
                              placeholder="€/Monat"
                              className="w-full p-2 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1"
                            />
                          </div>
                          <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                            {provider.scores.price2}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* Speed Row - nur für Internet */}
                {projectInfo.serviceType === 'internet' && (
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                      Download-Geschwindigkeit (Mbit/s)
                      <Tooltip content={tooltips.speed.content} title={tooltips.speed.title}>
                        <Info className="w-4 h-4 ml-2 text-blue-500" />
                      </Tooltip>
                    </td>
                    <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>35%</td>
                    {providers.map((provider, index) => (
                      <td key={index} className="p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div style={{ backgroundColor: 'var(--light-gray)' }}>
                            <input
                              type="number"
                              value={provider.speed || ''}
                              onChange={(e) => updateProvider(index, 'speed', e.target.value)}
                              placeholder="Mbit/s"
                              className="w-full p-2 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1"
                            />
                          </div>
                          <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                            {provider.scores.speed || 0}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* Stability Row - nur für Internet */}
                {projectInfo.serviceType === 'internet' && (
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                      Technologie/Stabilität
                      <Tooltip content={tooltips.stability.content} title={tooltips.stability.title}>
                        <Info className="w-4 h-4 ml-2 text-blue-500" />
                      </Tooltip>
                    </td>
                    <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>20%</td>
                    {providers.map((provider, index) => (
                      <td key={index} className="p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div style={{ backgroundColor: 'var(--light-gray)' }}>
                            <select
                              value={provider.stability || ''}
                              onChange={(e) => updateProvider(index, 'stability', e.target.value)}
                              className="w-full p-2 text-center text-xs border border-gray-200 rounded focus:outline-none focus:ring-1"
                            >
                              <option value="">Wählen...</option>
                              <option value="glasfaser">Glasfaser</option>
                              <option value="kabel_docsis31">Kabel DOCSIS 3.1</option>
                              <option value="kabel_docsis30">Kabel DOCSIS 3.0</option>
                              <option value="vdsl">VDSL</option>
                              <option value="lte_5g">LTE/5G</option>
                              <option value="dsl">DSL</option>
                            </select>
                          </div>
                          <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                            {provider.scores.stability || 0}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* Rating Row */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                    Bewertung/Service (Verivox)
                    <Tooltip content={tooltips.rating.content} title={tooltips.rating.title}>
                      <Info className="w-4 h-4 ml-2 text-blue-500" />
                    </Tooltip>
                  </td>
                  <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                    {projectInfo.serviceType === 'internet' ? '20%' : '30%'}
                  </td>
                  {providers.map((provider, index) => (
                    <td key={index} className="p-2">
                      <div className="grid grid-cols-2 gap-1">
                        <div style={{ backgroundColor: 'var(--light-gray)' }}>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={provider.rating || ''}
                            onChange={(e) => updateProvider(index, 'rating', e.target.value)}
                            placeholder="Sterne"
                            className="w-full p-2 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1"
                          />
                        </div>
                        <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                          {provider.scores.rating.toFixed(1)}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Size Row - nur wenn nicht Internet */}
                {projectInfo.serviceType !== 'internet' && (
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-semibold flex items-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--charcoal)' }}>
                      Größe Anbieter (Bewertungen)
                      <Tooltip content={tooltips.size.content} title={tooltips.size.title}>
                        <Info className="w-4 h-4 ml-2 text-blue-500" />
                      </Tooltip>
                    </td>
                    <td className="p-4 text-center font-semibold" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>15%</td>
                    {providers.map((provider, index) => (
                      <td key={index} className="p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div style={{ backgroundColor: 'var(--light-gray)' }}>
                            <input
                              type="number"
                              value={provider.size || ''}
                              onChange={(e) => updateProvider(index, 'size', e.target.value)}
                              placeholder="Anzahl"
                              className="w-full p-2 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1"
                            />
                          </div>
                          <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f5f5f5', color: 'var(--charcoal)' }}>
                            {provider.scores.size}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* Total Row */}
                <tr style={{ background: 'linear-gradient(45deg, var(--sage-green), var(--forest-green))' }}>
                  <td className="p-4 text-white font-bold text-lg">🏆 NUTZWERT (gewichtet)</td>
                  <td className="p-4 text-white font-bold text-center">100%</td>
                  {providers.map((_, index) => (
                    <td key={index} className="p-4 text-white font-bold text-center text-lg">
                      {totals[index]?.toFixed(2) || '0.00'}
                    </td>
                  ))}
                </tr>

                {/* Ranking Row */}
                <tr style={{ background: 'linear-gradient(45deg, var(--forest-green), var(--charcoal))' }}>
                  <td className="p-4 text-white font-bold text-lg">🥇 RANKING</td>
                  <td className="p-4 text-white font-bold text-center">-</td>
                  {providers.map((_, index) => (
                    <td key={index} className={`p-4 text-white font-bold text-center text-xl ${rankings[index] === 1 ? 'animate-pulse' : ''}`}>
                      {rankings[index] ? getRankIcon(rankings[index]) : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-xl shadow-lg p-6 no-print" style={{ borderLeft: '4px solid var(--sage-green)' }}>
          <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--charcoal)' }}>
            📊 Automatisierte Bewertungsmethodik
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
              <span><strong>Bereits Vertrag vorhanden ({projectInfo.serviceType === 'internet' ? '10%' : '15%'}):</strong> Checkbox → 0 oder 10 Punkte</span>
            </div>
            <div className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
              <span><strong>Preis ({projectInfo.serviceType === 'internet' ? '35%' : 'Jahr 1 & 2 je 20%'}):</strong> Günstigster = 10 Punkte, je 2% teurer = -1 Punkt</span>
            </div>
            <div className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
              <span><strong>Bewertung/Service ({projectInfo.serviceType === 'internet' ? '20%' : '30%'}):</strong> Verivox-Sterne × 2 = Punkte (max. 10)</span>
            </div>
            {projectInfo.serviceType === 'internet' ? (
              <>
                <div className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
                  <span><strong>Download-Geschwindigkeit (35%):</strong> Gestaffelt von 25 Mbit/s (1 Punkt) bis 1000+ Mbit/s (10 Punkte)</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
                  <span><strong>Technologie/Stabilität (20%):</strong> Glasfaser (10) > Kabel > VDSL > DSL/LTE</span>
                </div>
              </>
            ) : (
              <div className="flex items-start">
                <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
                <span><strong>Größe Anbieter (15%):</strong> Gestaffelt nach Bewertungsanzahl (100-5000+)</span>
              </div>
            )}
            <div className="flex items-start">
              <Check className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--sage-green)' }} />
              <span><strong>Berechnung:</strong> Nutzwert = Σ(Punkte × Gewichtung)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffComparison;