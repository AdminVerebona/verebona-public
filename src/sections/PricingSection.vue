<template>
<section id="pricing" style="background:#F5F8FD;color:#0F1B33;padding:88px 24px">
  <div style="max-width:1280px;margin:0 auto">
    <div class="vb-reveal" style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:14px;flex-wrap:wrap">
      <div>
        <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#2563EB;margin-bottom:10px">Tarifs</div>
        <h2 style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:#0F1B33;margin-bottom:10px;max-width:680px;line-height:1.12">Verebona automatise l'organisation de votre patrimoine.</h2>
        <p style="font-size:15.5px;color:#5B6577;max-width:620px">Ajoutez vos documents. Verebona les analyse, les classe, complète vos informations et fait remonter vos échéances importantes. Choisissez l'offre adaptée, seul ou à deux.</p>
      </div>
    </div>
    <div style="font-size:14px;color:#5B6577;margin-bottom:24px"><strong style="color:#0F1B33">2 mois offerts</strong> sur toutes les offres — aucun paiement aujourd'hui, carte bancaire requise.</div>
    <div class="vb-rgroup r-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:stretch">
      <!-- Standard -->
      <div style="display:flex;flex-direction:column;padding:24px;border-radius:18px;background:#fff;border:1px solid #E6EBF3">
        <h3 style="font-size:18px;font-weight:600;color:#0F1B33;margin-bottom:6px">Standard</h3>
        <p style="font-size:13px;color:#5B6577;line-height:1.5;margin-bottom:16px;min-height:56px">Pour découvrir Verebona et centraliser vos premiers biens et documents.</p>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:32px;font-weight:600;color:#0F1B33;margin-bottom:16px">19 €<span style="font-size:15px;font-weight:400;color:#8A93A6"> / an</span></div>
        <a href="#" style="text-align:center;font-size:14px;font-weight:600;color:#0F1B33;padding:11px;border-radius:10px;border:1px solid #D3DBE8;margin-bottom:18px">Choisir Standard</a>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:#5B6577">
          <div style="display:flex;gap:9px"><span style="color:#2563EB;font-weight:700">✓</span>Jusqu'à 2 biens actifs</div>
          <div style="display:flex;gap:9px"><span style="color:#2563EB;font-weight:700">✓</span>Analyse de 50 documents / an</div>
          <div style="display:flex;gap:9px"><span style="color:#2563EB;font-weight:700">✓</span>Recherche intelligente</div>
          <div style="display:flex;gap:9px"><span style="color:#2563EB;font-weight:700">✓</span>Agenda de mes biens</div>
          <div style="display:flex;gap:9px"><span style="color:#2563EB;font-weight:700">✓</span>Accès desktop & mobile</div>
          <div style="display:flex;gap:9px"><span style="color:#2563EB;font-weight:700">✓</span>Export ZIP de mes documents</div>
        </div>
      </div>
      <!-- Premium (recommandé) -->
      <div style="display:flex;flex-direction:column;padding:24px;border-radius:18px;background:linear-gradient(180deg,#0E1B36,#0B1428);border:1px solid rgba(59,130,246,.5);position:relative;box-shadow:0 24px 50px rgba(15,27,51,.25)">
        <span style="position:absolute;top:16px;right:16px;font-size:11px;padding:4px 11px;border-radius:999px;background:rgba(59,130,246,.18);border:1px solid rgba(96,165,250,.7);color:#BFDBFE">Recommandé</span>
        <h3 style="font-size:18px;font-weight:600;color:#fff;margin-bottom:6px">Premium</h3>
        <p style="font-size:13px;color:#9DB0CE;line-height:1.5;margin-bottom:16px;min-height:56px">Pour des dossiers impeccables à présenter à un acheteur ou un assureur.</p>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:32px;font-weight:600;color:#fff;margin-bottom:16px">59 €<span style="font-size:15px;font-weight:400;color:#8DA0BE"> / an</span></div>
        <a href="#" style="text-align:center;font-size:14px;font-weight:600;color:#fff;padding:11px;border-radius:10px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);margin-bottom:18px;box-shadow:0 12px 26px rgba(37,99,235,.4)">Choisir Premium</a>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:#9DB0CE">
          <div style="display:flex;gap:9px"><span style="color:#60A5FA;font-weight:700">✓</span><strong style="color:#EAF0FB">Tout Standard +</strong></div>
          <div style="display:flex;gap:9px"><span style="color:#60A5FA;font-weight:700">✓</span>10 biens actifs</div>
          <div style="display:flex;gap:9px"><span style="color:#60A5FA;font-weight:700">✓</span>100 documents analysés / an</div>
          <div style="display:flex;gap:9px"><span style="color:#60A5FA;font-weight:700">✓</span>Synchro avec votre agenda personnel</div>
          <div style="display:flex;gap:9px"><span style="color:#60A5FA;font-weight:700">✓</span>Exports documentaires prêts à l'emploi</div>
          <div style="display:flex;gap:9px"><span style="color:#60A5FA;font-weight:700">✓</span>Support prioritaire</div>
        </div>
      </div>
      <!-- Duo -->
      <div style="display:flex;flex-direction:column;padding:24px;border-radius:18px;background:#fff;border:1px solid rgba(52,211,153,.45);position:relative">
        <span style="position:absolute;top:16px;right:16px;font-size:11px;padding:4px 11px;border-radius:999px;background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.5);color:#059669">Nouveau</span>
        <h3 style="font-size:18px;font-weight:600;color:#0F1B33;margin-bottom:6px">Premium Duo</h3>
        <p style="font-size:13px;color:#5B6577;line-height:1.5;margin-bottom:16px;min-height:56px">Partagez un espace Verebona à deux pour gérer ensemble biens, documents et échéances.</p>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:32px;font-weight:600;color:#0F1B33;margin-bottom:16px">79 €<span style="font-size:15px;font-weight:400;color:#8A93A6"> / an</span></div>
        <a href="#" style="text-align:center;font-size:14px;font-weight:600;color:#fff;padding:11px;border-radius:10px;background:linear-gradient(135deg,#34D399,#059669);margin-bottom:18px;box-shadow:0 12px 26px rgba(52,211,153,.32)">Choisir Premium Duo</a>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:#5B6577">
          <div style="display:flex;gap:9px"><span style="color:#059669;font-weight:700">✓</span><strong style="color:#0F1B33">Tout Premium +</strong></div>
          <div style="display:flex;gap:9px"><span style="color:#059669;font-weight:700">✓</span>2 membres sur un même compte</div>
          <div style="display:flex;gap:9px"><span style="color:#059669;font-weight:700">✓</span>Espace commun : biens, docs, échéances</div>
          <div style="display:flex;gap:9px"><span style="color:#059669;font-weight:700">✓</span>Gestion collaborative</div>
        </div>
      </div>
      <!-- Pro -->
      <div style="display:flex;flex-direction:column;padding:24px;border-radius:18px;background:#F3F5F9;border:1px solid #E6EBF3;opacity:.8">
        <span style="align-self:flex-start;font-size:11px;padding:4px 11px;border-radius:999px;background:#E7EBF2;border:1px solid #D3DBE8;color:#8A93A6;margin-bottom:8px">Bientôt</span>
        <h3 style="font-size:18px;font-weight:600;color:#5B6577;margin-bottom:6px">Premium Pro</h3>
        <p style="font-size:13px;color:#8A93A6;line-height:1.5;margin-bottom:16px;min-height:56px">Pour les professionnels gérant plusieurs portefeuilles.</p>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:28px;font-weight:600;color:#8A93A6;margin-bottom:16px">Bientôt</div>
        <div style="text-align:center;font-size:14px;font-weight:600;color:#A2ABBC;padding:11px;border-radius:10px;border:1px solid #D3DBE8;margin-bottom:18px">Bientôt disponible</div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:#8A93A6">
          <div style="display:flex;gap:9px"><span style="color:#A78BFA;font-weight:700">✓</span>Tout Premium +</div>
          <div style="display:flex;gap:9px"><span style="color:#A78BFA;font-weight:700">✓</span>Gestion matériel professionnel</div>
          <div style="display:flex;gap:9px"><span style="color:#A78BFA;font-weight:700">✓</span>Plusieurs utilisateurs avec rôles</div>
          <div style="display:flex;gap:9px"><span style="color:#A78BFA;font-weight:700">✓</span>API & intégrations avancées</div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>
