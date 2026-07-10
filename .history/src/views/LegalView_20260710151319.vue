<template>
<section style="position:relative;padding:128px 24px 48px;overflow:hidden;background:radial-gradient(1000px 560px at 12% -10%,rgba(59,130,246,.18),transparent 60%),#070E20">
  <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(148,163,184,.09) 1px,transparent 1px);background-size:34px 34px;-webkit-mask-image:linear-gradient(to bottom,#000,transparent 85%);mask-image:linear-gradient(to bottom,#000,transparent 85%);pointer-events:none"></div>
  <div style="max-width:900px;margin:0 auto;position:relative">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:24px"><ol style="display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0;font-size:13.5px"><li style="display:flex;align-items:center"><a href="#" @click.prevent="goHome" style="display:inline-flex;align-items:center;gap:7px;color:#9FB4D8;font-weight:500;padding:6px 11px;border-radius:9px;cursor:pointer;transition:color .15s,background .15s" v-hover="{color:'#fff',background:'rgba(255,255,255,.06)'}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg>Accueil</a></li><li aria-hidden="true" style="display:flex;color:#42557A"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></li><li aria-current="page" style="color:#EAF0FB;font-weight:600;padding:6px 4px">{{ crumbLabel }}</li></ol></nav>
    <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:16px">Informations légales</div>
    <h1 style="font-size:40px;line-height:1.08;font-weight:600;letter-spacing:-.025em;color:#fff">{{ legalTitle }}</h1>
  </div>
</section>
<section style="background:#F6F8FC;padding:30px 24px 72px">
  <div style="max-width:900px;margin:0 auto">
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px">
      <button type="button" :style="legalMentionsStyle" @click.prevent="goMentions">Mentions légales</button>
      <button type="button" :style="legalCGUStyle" @click.prevent="goCGU">CGSU</button>
      <button type="button" :style="legalConfidStyle" @click.prevent="goConfid">Confidentialité</button>
    </div>
    <div style="background:#fff;border:1px solid #E6EBF3;border-radius:20px;padding:40px 42px;box-shadow:0 12px 34px rgba(15,27,51,.05)">
      <template v-if="isMentions">
        <div style="font-size:15.5px;line-height:1.75;color:#334155">
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">1. Éditeur du site</h2>
          <p style="margin:0 0 6px"><span style="font-size:16px;font-weight:500;color:#0F1B33">Raison sociale :</span> Verebona</p>
          <p style="margin:0 0 6px"><span style="font-size:16px;font-weight:500;color:#0F1B33">Siège social :</span> [Adresse à compléter]</p>
          <p style="margin:0 0 6px"><span style="font-size:16px;font-weight:500;color:#0F1B33">SIRET :</span> [Numéro à compléter]</p>
          <p style="margin:0 0 6px"><span style="font-size:16px;font-weight:500;color:#0F1B33">Email :</span> contact@verebona.com</p>
          <p style="margin:0 0 16px"><span style="font-size:16px;font-weight:500;color:#0F1B33">Directeur de la publication :</span> [Nom à compléter]</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">Hébergement</h2>
          <p style="margin:0 0 22px">Le site et l’application Verebona sont hébergés par : SCALINGO SAS</p>

<p style="margin:0 0 6px">13 rue Jacques Peirotes, 67000 Strasbourg, France</p>

<p style="margin:0 0 6px">Téléphone : [numéro à obtenir auprès de Scalingo]</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">Propriété intellectuelle</h2>
          <p style="margin:0">L'ensemble des éléments du site (marque, logo, textes, interfaces, illustrations) est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de Verebona SAS. Toute reproduction sans autorisation préalable est interdite.</p>
        </div>
      </template>
      <template v-if="isCGU">
        <div style="font-size:15.5px;line-height:1.75;color:#334155">
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">1. Objet</h2>
          <p style="margin:0 0 22px">Les présentes conditions générales de service et d'utilisation (CGSU) définissent les modalités d'accès et d'utilisation de la plateforme Verebona, service de centralisation et d'organisation documentaire du patrimoine.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">2. Compte et abonnement</h2>
          <p style="margin:0 0 22px">L'accès au service nécessite la création d'un compte et la souscription d'une offre. L'utilisateur s'engage à fournir des informations exactes et à préserver la confidentialité de ses identifiants.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">3. Nature du service</h2>
          <p style="margin:0 0 22px">Verebona est une plateforme d'organisation. Les documents importés ne sont ni certifiés, ni validés, ni garantis juridiquement. L'utilisateur reste seul responsable de l'exactitude des informations qu'il enregistre.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">4. Responsabilités</h2>
          <p style="margin:0 0 22px">Verebona met en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité du service, sans obligation de résultat concernant une disponibilité ininterrompue.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">5. Résiliation</h2>
          <p style="margin:0">L'utilisateur peut résilier son abonnement à tout moment. Des modalités de récupération des données sont prévues afin d'éviter tout verrouillage à la fin du contrat.</p>
        </div>
      </template>
      <template v-if="isConfid">
        <div style="font-size:15.5px;line-height:1.75;color:#334155">
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">Données collectées</h2>
          <p style="margin:0 0 22px">Verebona collecte les données nécessaires au fonctionnement du service : informations de compte, contenus importés (fiches de biens, documents) et données d'usage strictement utiles à l'amélioration du service.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">Finalités</h2>
          <p style="margin:0 0 22px">Les données sont traitées pour fournir le service, assurer la sécurité, et répondre aux obligations légales. Elles ne sont jamais cédées à des tiers à des fins commerciales.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">Sécurité</h2>
          <p style="margin:0 0 22px">Vos données sont chiffrées lors du stockage et des échanges, et hébergées sur une infrastructure sécurisée au sein de l'Union européenne.</p>
          <h2 style="font-size:20px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif;margin:0 0 10px">Vos droits</h2>
          <p style="margin:0">Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. Pour exercer ces droits, écrivez à contact@verebona.com.</p>
        </div>
      </template>
    </div>
    <p style="font-size:13px;color:#94A3B8;margin-top:22px;text-align:center">Dernière mise à jour : 2025 · Pour toute question, <a href="#" @click.prevent="goContact" style="color:#2563EB;font-weight:600">contactez-nous</a>.</p>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLegal } from '../composables/useLegal'
import { useNav } from '../composables/useNav'
const { isMentions, isCGU, isConfid, legalTitle, legalMentionsStyle, legalCGUStyle, legalConfidStyle, crumbLabel } = useLegal()
const { goHome, goContact, goMentions, goCGU, goConfid } = useNav()
</script>
