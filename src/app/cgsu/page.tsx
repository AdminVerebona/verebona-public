import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales",
  description: "Conditions générales d'utilisation et de services de Verebona.",
  alternates: { canonical: 'https://verebona.app/cgsu' },
};

export default function CGSUPage() {
  return (
    <div className="public-page min-h-screen flex flex-col bg-gradient-to-b from-[#FDFCFB] via-[#FDFCFB] to-[#F3F4F6]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-gray-200 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">
              Conditions Générales d'Utilisation et de Services de Verebona
            </h1>
            <p className="text-sm text-gray-500">
              Dernière mise à jour : 20/12/2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8 shadow-sm text-gray-800">
            
            {/* 1. Objet */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                1. Objet
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>
                  Les présentes Conditions Générales d'Utilisation et de Services (ci-après les « CGSU ») ont pour objet de définir les conditions dans lesquelles :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>la société Verebona (ci-après « Verebona » ou « l'Éditeur ») met à disposition des utilisateurs un service en ligne de gestion et d'organisation d'informations et de documents relatifs à leurs biens patrimoniaux (ci-après le « Service ») ;</li>
                  <li>toute personne physique ou morale (ci-après l'« Utilisateur ») accède au Service et l'utilise.</li>
                </ul>
                <p>
                  Les CGSU constituent le socle contractuel de la relation entre Verebona et l'Utilisateur. Toute utilisation du Service implique l'acceptation pleine et entière des CGSU en vigueur au jour de l'utilisation.
                </p>
              </div>
            </section>

            {/* 2. Définitions */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                2. Définitions
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Aux fins des présentes, les termes suivants ont la signification ci-dessous :</p>
                <div className="space-y-3 ml-4">
                  <p><strong className="text-[color:var(--text-primary)]">« Site » :</strong> le site internet édité par Verebona et accessible à l'adresse [URL du site] ainsi que l'ensemble de ses sous-domaines et versions mobiles.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Service » :</strong> l'ensemble des fonctionnalités proposées par Verebona via le Site, permettant notamment à l'Utilisateur de créer un compte, d'enregistrer certaines informations et documents relatifs à ses biens patrimoniaux, de les organiser et de les consulter.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Compte » :</strong> l'espace personnel de l'Utilisateur accessible après authentification, à partir duquel celui-ci peut utiliser le Service.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Offre Gratuite » :</strong> version du Service accessible sans contrepartie financière, avec des fonctionnalités et/ou un volume limité, telles que décrites sur le Site.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Offres Payantes » :</strong> offres d'abonnement (notamment « Premium » et/ou « Pro ») donnant accès à des fonctionnalités et/ou capacités supplémentaires, telles que décrites sur le Site, moyennant le paiement d'un prix.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Données » :</strong> l'ensemble des informations, fichiers, contenus et documents, y compris les données à caractère personnel, que l'Utilisateur renseigne ou téléverse dans le cadre du Service.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Documents » :</strong> tout fichier ou contenu documentaire (factures, contrats, certificats, photos, etc.) téléversé par l'Utilisateur dans le Service.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Documents sensibles » :</strong> tout Document contenant des informations personnelles, patrimoniales, financières et/ou d'identification d'un bien ou d'une personne (notamment factures, justificatifs de propriété, contrats, certificats, attestations, expertises ou tout document dont la perte, l'altération ou la divulgation est susceptible de causer un préjudice matériel ou moral à l'Utilisateur ou à un tiers).</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Consommateur » :</strong> l'Utilisateur répondant à la définition de consommateur au sens du Code de la consommation.</p>
                  <p><strong className="text-[color:var(--text-primary)]">« Professionnel » :</strong> l'Utilisateur agissant dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole.</p>
                </div>
              </div>
            </section>

            {/* 3. Acceptation, opposabilité et modification des CGSU */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                3. Acceptation, opposabilité et modification des CGSU
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">3.1. Acceptation</p>
                  <p>Les CGSU sont portées à la connaissance de l'Utilisateur lors de la création de son Compte et/ou de l'utilisation du Service.</p>
                  <p className="mt-2">L'Utilisateur les accepte en cochant la case prévue à cet effet et/ou en poursuivant l'utilisation du Service.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">3.2. Opposabilité</p>
                  <p>Les CGSU applicables sont celles en vigueur au jour de l'utilisation du Service étant précisé que les conditions tarifaires applicables à une période d’abonnement payée demeurent celles acceptées lors de la souscription/du renouvellement pour ladite période. Elles prévalent sur tout autre document, sauf accord écrit spécifique.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">3.3. Modification des CGSU</p>
                  <p>Verebona peut modifier les CGSU à tout moment, notamment pour les adapter à l'évolution du Service ou de la réglementation.</p>
                  <p className="mt-2">L'Utilisateur sera informé de toute modification substantielle par tout moyen approprié (notification sur le Site, email, etc.). Les modifications tarifaires sont régies par l’article 9.2.</p>
                  <p className="mt-2">En cas de désaccord, l'Utilisateur peut résilier son abonnement (désactiver la reconduction) avant l'entrée en vigueur de la nouvelle version. L'utilisation du Service après ce délai vaut acceptation des nouvelles CGSU.</p>
                </div>
              </div>
            </section>

            {/* 4. Accès au Site et au Service */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                4. Accès au Site et au Service
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.1. Accès technique</p>
                  <p>L'Utilisateur dispose, sous sa responsabilité, des moyens techniques et logiciels nécessaires pour accéder à Internet et au Site.</p>
                  <p className="mt-2">Les frais de connexion restent à la charge de l'Utilisateur.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.2. Éligibilité</p>
                  <p>Le Service est réservé :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>aux personnes physiques majeures capables juridiquement, ou mineures dûment autorisées par leurs représentants légaux ;</li>
                    <li>et/ou aux personnes morales via leurs représentants habilités.</li>
                  </ul>
                  <p className="mt-2">Verebona peut demander tout justificatif et suspendre ou refuser l'accès en cas de doute raisonnable sur l'éligibilité ou l'identité.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">4.3. Disponibilité</p>
                  <p>Verebona met en œuvre des moyens raisonnables pour assurer la disponibilité du Site et du Service.</p>
                  <p className="mt-2">Le Service peut toutefois être momentanément interrompu, notamment pour maintenance, mise à jour ou cas de force majeure.</p>
                  <p className="mt-2">Verebona ne garantit pas la disponibilité continue et sans erreur du Service.</p>
                </div>
              </div>
            </section>

            {/* 5. Description générale du Service */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                5. Description générale du Service
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Les fonctionnalités du Service (gratuites et payantes) sont décrites sur le Site.</p>
                <p>De manière générale, le Service permet à l'Utilisateur, selon l'Offre choisie :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>de créer et gérer un Compte ;</li>
                  <li>d'enregistrer certaines informations relatives à ses biens patrimoniaux ;</li>
                  <li>d'importer, stocker et organiser des Documents ;</li>
                  <li>de consulter et éventuellement exporter certaines Données.</li>
                </ul>
                <p className="mt-3">
                  Le Service a pour vocation de faciliter la gestion et l'organisation des informations et Documents de l'Utilisateur. Il ne constitue ni :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>un service de conseil juridique, fiscal, comptable, financier ou assurantiel ;</li>
                  <li>un service d'archivage électronique qualifié ou à valeur probante ;</li>
                  <li>un coffre-fort électronique bénéficiant d'une certification spécifique.</li>
                </ul>
                <p className="mt-3">L'Utilisateur demeure seul responsable des décisions prises sur la base des informations gérées via le Service et de la pertinence du Service au regard de ses besoins propres.</p>
              </div>
            </section>

            {/* 6. Création de Compte */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                6. Création de Compte
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">6.1. Procédure d'inscription</p>
                  <p>Pour utiliser le Service, l'Utilisateur doit créer un Compte en fournissant les informations demandées (par exemple : nom, prénom, adresse email, mot de passe, etc.).</p>
                  <p className="mt-2">L'Utilisateur s'engage à fournir des informations exactes, complètes et à jour, et à les mettre à jour en cas de changement.</p>
                  <p className="mt-2">Verebona se réserve le droit de suspendre ou résilier tout Compte créé sur la base d'informations manifestement fausses, inexactes ou usurpant l'identité d'un tiers.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">6.2. Identifiants</p>
                  <p>Les identifiants de connexion (email, mot de passe) sont personnels et confidentiels.</p>
                  <p className="mt-2">L'Utilisateur s'engage à :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>ne pas les communiquer à des tiers ;</li>
                    <li>prendre les mesures nécessaires pour éviter toute utilisation non autorisée (mot de passe robuste, non réutilisation, etc.) ;</li>
                    <li>informer immédiatement Verebona de toute suspicion de compromission.</li>
                  </ul>
                  <p className="mt-2">Toute connexion et action effectuée à partir du Compte de l'Utilisateur est réputée effectuée par ce dernier, sauf preuve contraire.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">6.3. Nombre de Comptes</p>
                  <p>Sauf accord préalable et écrit de Verebona, un Utilisateur ne peut pas créer plusieurs Comptes au titre d'une même identité.</p>
                </div>
              </div>
            </section>

            {/* 7. Utilisation du Service */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                7. Utilisation du Service
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">7.1. Usage conforme</p>
                  <p>L'Utilisateur s'engage à utiliser le Service :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>conformément aux lois et règlements en vigueur ;</li>
                    <li>conformément aux présentes CGSU ;</li>
                    <li>dans le respect des droits de Verebona et des tiers.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">7.2. Interdictions</p>
                  <p>Il est notamment interdit à l'Utilisateur de :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>utiliser le Service à des fins illicites, frauduleuses ou contraires à l'ordre public ;</li>
                    <li>porter atteinte aux droits de propriété intellectuelle de Verebona ou de tiers ;</li>
                    <li>tenter d'accéder de manière non autorisée à d'autres Comptes, systèmes ou Données ;</li>
                    <li>contourner les dispositifs de sécurité ou de contrôle ;</li>
                    <li>saturer, perturber ou de grader le fonctionnement du Service ;</li>
                    <li>extraire, par tout moyen (notamment scraping), tout ou partie des données, contenus ou structures du Service à des fins autres que l'utilisation normale du Service ;</li>
                    <li>utiliser le Service en vue de développer un service concurrent ou de procéder à toute forme de rétro ingénierie du Service, sauf disposition légale impérative contraire.</li>
                  </ul>
                  <p className="mt-2">Verebona se réserve le droit de suspendre ou résilier tout Compte en cas de violation des présentes.</p>
                </div>
              </div>
            </section>

            {/* 8. Traitement des documents, OCR, documents sensibles et responsabilités */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                8. Traitement des documents, OCR, documents sensibles et responsabilités
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">8.1. Dépôt et traitement technique des Documents</p>
                  <p>L'Utilisateur peut déposer dans le Service des Documents liés à la gestion et à l'organisation de ses biens.</p>
                  <p className="mt-2">Verebona traite ces Documents exclusivement pour fournir les fonctionnalités du Service, notamment :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>stockage, prévisualisation et classement des Documents ;</li>
                    <li>synchronisation technique et sauvegarde ;</li>
                    <li>extraction automatisée de certaines selon l’Offre souscrite (par exemple via des technologies de reconnaissance optique de caractères – OCR – ou des technologies similaires), afin d'alimenter ou faciliter certaines fonctionnalités du Service.</li>
                  </ul>
                  <p className="mt-2">Ces traitements peuvent être réalisés par Verebona ou par des sous-traitants dûment autorisés, y compris situés hors de l'Union européenne, dans le respect des exigences du RGPD. Verebona ne garantit pas que ces traitements seront exclusivement opérés dans l'UE, mais met en œuvre les garanties appropriées prévues par le RGPD en cas de transfert.</p>
                  <p className="mt-2">Verebona n'accède pas volontairement au contenu des Documents, sauf :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>pour assurer les traitements techniques ci-dessus ;</li>
                    <li>en cas de maintenance, support ou incident de sécurité nécessitant une intervention spécifique ;</li>
                    <li>en cas d'obligation légale ou judiciaire ;</li>
                    <li>en présence d'un signalement ou d'une suspicion sérieuse de contenu illicite.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">8.2. Présence éventuelle de données sensibles</p>
                  <p>Les Documents déposés peuvent contenir, selon l'usage que fait l'Utilisateur, des données à caractère personnel, y compris potentiellement des catégories particulières de données au sens de l'article 9 du RGPD (« données sensibles »).</p>
                  <p className="mt-2">Verebona :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>n'a pas vocation à collecter, traiter ou analyser de telles données sensibles ;</li>
                    <li>n'en sollicite en aucun cas le dépôt ;</li>
                    <li>ne peut toutefois empêcher qu'elles figurent dans un Document si l'Utilisateur décide de les y inclure.</li>
                  </ul>
                  <p className="mt-2">L'Utilisateur reconnaît en conséquence :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>que la présence de telles données relève de sa seule initiative et responsabilité ;</li>
                    <li>qu'il est seul responsable du caractère licite, adéquat et pertinent du contenu des Documents ;</li>
                    <li>qu'il demeure responsable de toute obligation légale ou réglementaire de conservation, de sécurisation ou de confidentialité applicable à certains documents qu'il téléverse.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">8.3. Documents sensibles au sens contractuel</p>
                  <p>Indépendamment du RGPD, sont considérés comme Documents sensibles au sens des présentes CGSU tous Documents contenant des informations personnelles, financières, patrimoniales ou permettant d'identifier un bien ou un propriétaire (par exemple : factures, contrats, certificats, documents d'assurance, expertises, numéros de série, adresses).</p>
                  <p className="mt-2">L'Utilisateur reconnaît expressément que :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>le Service n'est pas un coffre-fort électronique certifié, ni un service d'archivage électronique à valeur probante ;</li>
                    <li>aucune solution numérique ne peut garantir une sécurité ou une disponibilité absolue ;</li>
                    <li>il lui appartient de vérifier si le Service est adapté à la sensibilité des Documents téléversés ;</li>
                    <li>il demeure seul responsable de conserver toute copie, original ou double qu'il juge nécessaire, notamment pour faire valoir ses droits auprès de tiers (assureurs, vendeurs, administrations, etc.).</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">8.4. Contenus interdits</p>
                  <p>L'Utilisateur s'interdit de téléverser, stocker ou partager via le Service des Documents :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>contraires aux lois et règlements (documents illicites, diffamatoires, injurieux, discriminatoires, haineux, violents, etc.) ;</li>
                    <li>portant atteinte aux droits de propriété intellectuelle ou à la vie privée de tiers ;</li>
                    <li>contenant des données personnelles de tiers sans base légale suffisante ;</li>
                    <li>contenant des virus, malwares ou composants susceptibles de nuire au Service ;</li>
                    <li>contenant des catégories particulières de données au sens du RGPD (notamment données de santé, opinions politiques, convictions religieuses ou philosophiques, appartenance syndicale, données biométriques aux fins d'identifier une personne, données relatives à la vie sexuelle ou à l'orientation sexuelle), sauf exception expresse prévue par Verebona.</li>
                  </ul>
                  <p className="mt-2">Verebona pourra supprimer ou rendre inaccessible tout Document manifestement illicite ou notifié comme tel, et prendre toute mesure nécessaire, y compris la suspension du Compte.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">8.5. Responsabilité et limites</p>
                  <p>L'Utilisateur :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>demeure seul responsable du contenu des Documents qu'il dépose ;</li>
                    <li>garantit que les Documents sont licites et ne portent pas atteinte aux droits de tiers ;</li>
                    <li>garantit Verebona contre toute réclamation ou recours de tiers relatifs aux Documents (atteinte à la vie privée, propriété intellectuelle, confidentialité, etc.) ;</li>
                    <li>reconnaît que Verebona n'est tenue qu'à une obligation de moyens en matière de sécurité et de conservation des Documents, y compris sensibles.</li>
                  </ul>
                  <p className="mt-2">Verebona n'est pas responsable :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>des pertes de Documents résultant d'une suppression par l'Utilisateur ou d'une absence de sauvegarde externe de sa part ;</li>
                    <li>de l'inadéquation du Service aux besoins spécifiques de l'Utilisateur ;</li>
                    <li>des obligations de conservation imposées à l'Utilisateur par la loi ou par un tiers (assureur, vendeur, administration, etc.).</li>
                  </ul>
                  <p className="mt-2">Certaines copies résiduelles peuvent subsister temporairement dans les systèmes de sauvegarde, sans être accessibles en production, pour la durée strictement nécessaire à la gestion de ces sauvegardes.</p>
                </div>
              </div>
            </section>

            {/* 9. Offres, prix, abonnement et rétractation */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                9. Offres, prix, abonnement et rétractation
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">9.1. Offres</p>
                  <p>Les différentes Offres (Gratuite, Payantes) et leurs caractéristiques (fonctionnalités, limites, durée, prix) sont décrites sur le Site.</p>
                  <p className="mt-2">Verebona peut modifier ou retirer certaines Offres, sous réserve du respect des engagements en cours et des dispositions applicables aux Utilisateurs ayant déjà souscrit.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">9.2. Prix</p>
                  <p>Les prix des Offres Payantes sont indiqués sur le Site en euros et toutes taxes comprises (TTC), sauf mention contraire.</p>
                  <p className="mt-2">Verebona se réserve le droit de modifier ses tarifs à tout moment pour l'avenir étant précisé que le prix applicable à une période d’abonnement déjà payée reste inchangé jusqu’à son terme.</p>
                  <p className="mt-2">Toute modification tarifaire sera notifiée à l'Utilisateur concerné dans un délai raisonnable avant son entrée en vigueur.</p>
                  <p className="mt-2">En cas de refus des nouveaux tarifs, l'Utilisateur pourra résilier son abonnement avant l'application des nouveaux prix. À défaut, les nouveaux tarifs seront réputés acceptés.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">9.3. Facturation et paiement</p>
                  <p>Le paiement des Offres Payantes s'effectue par l'intermédiaire d'un prestataire de paiement tiers (Stripe) selon les modalités indiquées sur le Site.</p>
                  <p className="mt-2">En communiquant ses informations de paiement, l'Utilisateur autorise le débit du prix de l'abonnement selon la périodicité choisie (mensuelle, annuelle, etc.).</p>
                  <p className="mt-2">En cas de défaut de paiement ou d'incident de paiement :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Verebona pourra suspendre l'accès au Service payant ;</li>
                    <li>et/ou résilier l'abonnement, après notification restée sans effet.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">9.4. Durée et reconduction</p>
                  <p>Sauf mention contraire, les abonnements aux Offres Payantes sont conclus pour une durée déterminée (par exemple un (1) mois ou un (1) an) avec reconduction tacite à l'identique.</p>
                  <p className="mt-2">L'Utilisateur peut à tout moment désactiver la reconduction depuis son Compte, avant la date de renouvellement. La désactivation de la reconduction / résiliation prend effet à l’échéance de la période en cours ; aucun remboursement prorata temporis n’est dû sauf dispositions légales impératives.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">9.5. Droit de rétractation (Utilisateurs Consommateurs)</p>
                  <p>Lorsque l'Utilisateur a la qualité de Consommateur et souscrit une Offre Payante à distance, il dispose en principe d'un droit de rétractation de quatorze (14) jours à compter de la confirmation de la souscription.</p>
                  <p className="mt-2">Si l'Utilisateur demande expressément que l'exécution du Service commence avant la fin du délai de rétractation :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>l'Utilisateur conserve son droit de rétractation tant que le Service n'a pas été intégralement exécuté ;</li>
                    <li>en cas d'exercice du droit de rétractation avant la fin du délai de quatorze (14) jours, l'Utilisateur devra verser à Verebona un montant proportionnel au Service fourni jusqu'à la communication de sa décision de se rétracter.</li>
                  </ul>
                  <p className="mt-2">Le droit de rétractation ne s'applique plus si le Service a été pleinement exécuté avant la fin du délai de rétractation, après accord exprès de l'Utilisateur pour commencer l'exécution du Service et reconnaissance expresse de sa part qu'il perdra alors son droit de rétractation.</p>
                  <p className="mt-2">Les modalités d'exercice du droit de rétractation, le cas échéant, sont détaillées sur le Site et rappelées dans la confirmation de commande.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">9.6. Remboursements</p>
                  <p>En dehors des cas prévus par la loi, les sommes versées au titre des Offres Payantes ne sont pas remboursables, sauf décision contraire de Verebona à titre purement commercial.</p>
                </div>
              </div>
            </section>

            {/* 10. Disponibilité, maintenance et évolutions */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                10. Disponibilité, maintenance et évolutions
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">10.1. Disponibilité</p>
                  <p>Verebona met en œuvre des moyens raisonnables pour assurer l'accessibilité et le bon fonctionnement du Service. Des interruptions temporaires peuvent intervenir, notamment en cas de maintenance, mise à jour, incident ou force majeure.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">10.2. Maintenance</p>
                  <p>Verebona peut procéder à des opérations de maintenance planifiées ou non, susceptibles de rendre le Service indisponible.</p>
                  <p className="mt-2">Dans la mesure du possible, l'Utilisateur sera informé des maintenances planifiées.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">10.3. Évolutions</p>
                  <p>Verebona peut faire évoluer le Service, ajouter ou supprimer des fonctionnalités, corriger des erreurs, ou adapter l'interface.</p>
                  <p className="mt-2">Ces évolutions peuvent modifier la présentation ou le fonctionnement du Service, sans que cela ne donne droit à un quelconque dédommagement, sous réserve du respect des droits des Utilisateurs ayant souscrit une Offre Payante en cours.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">10.4. Cessation du Service</p>
                  <p>En cas de cessation définitive du Service, Verebona informera les Utilisateurs avec un préavis raisonnable et, en tout état de cause, d'au moins trente (30) jours, afin de leur permettre de récupérer leurs Documents.</p>
                  <p className="mt-2">Au-delà de ce délai, Verebona pourra supprimer les Données et Documents, sauf obligation légale de conservation.</p>
                </div>
              </div>
            </section>

            {/* 11. Sécurité */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                11. Sécurité
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Verebona met en œuvre des mesures techniques et organisationnelles raisonnables pour assurer la sécurité du Service et des Données (contrôles d'accès, chiffrement, etc.), dans le cadre d'une obligation de moyens.</p>
                <p>L'Utilisateur reconnaît que :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>aucune solution technique ne peut garantir une sécurité absolue ;</li>
                  <li>il lui appartient de mettre en place ses propres mesures de sécurité (notamment protection de ses terminaux, confidentialité de ses identifiants, sauvegardes externes des Documents et originaux).</li>
                </ul>
                <p className="mt-2">Certaines Données peuvent subsister de manière temporaire dans les systèmes de sauvegarde de Verebona, sans être accessibles en production, pour la durée strictement nécessaire à la gestion de ces sauvegardes.</p>
              </div>
            </section>

            {/* 12. Responsabilité */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                12. Responsabilité
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">12.1. Responsabilité de Verebona</p>
                  <p>Verebona est responsable des dommages directs, prévisibles et prouvés, causés à l'Utilisateur par un manquement à ses obligations contractuelles, dans le cadre d'une obligation de moyens.</p>
                  <p className="mt-2">En particulier, Verebona ne garantit pas :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>l'absence totale d'interruption, de bug ou d'erreur ;</li>
                    <li>la conservation éternelle des Documents ;</li>
                    <li>l'adéquation du Service aux besoins spécifiques de l'Utilisateur.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">12.2. Limitations de responsabilité</p>
                  <p>Dans les limites permises par la loi :</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Verebona ne pourra en aucun cas être tenue responsable des dommages indirects, immatériels ou consécutifs, tels que perte de chance, perte de profit, perte de données ou préjudice moral, même si elle a été informée de la possibilité de tels dommages ;</li>
                    <li>la responsabilité totale cumulée de Verebona, toutes causes confondues, envers un Utilisateur, est limitée :
                      <ul className="list-circle list-inside space-y-1 ml-6 mt-2">
                        <li>pour un Utilisateur d'Offre Payante : au montant des sommes effectivement versées par l'Utilisateur à Verebona au titre du Service au cours des douze (12) derniers mois précédant le fait générateur ;</li>
                        <li>pour un Utilisateur de l'Offre Gratuite : à la somme maximale de cent (100) euros.</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="mt-3">Ces limitations ne s'appliquent pas dans les cas où la loi interdit leur exclusion ou limitation, notamment en cas de décès, de dommages corporels causés par la faute de Verebona, ou en cas de faute lourde ou dolosive.</p>
                  <p className="mt-2">Pour les Utilisateurs ayant la qualité de Consommateur, les limitations de responsabilité prévues au présent article s'appliquent dans la mesure où elles ne contreviennent pas aux dispositions légales impératives qui leur sont applicables.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">12.3. Responsabilité de l'Utilisateur</p>
                  <p>L'Utilisateur est seul responsable :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>de l'exactitude, de la licéité et de la pertinence des Données et Documents ;</li>
                    <li>de l'usage qu'il fait du Service ;</li>
                    <li>de la conservation de ses originaux et de ses propres sauvegardes externes ;</li>
                    <li>des dommages causés à Verebona ou à des tiers du fait de l'utilisation du Service ou de la présence de Documents illicites ou portant atteinte aux droits de tiers.</li>
                  </ul>
                  <p className="mt-2">L'Utilisateur garantit Verebona contre toute réclamation ou recours d'un tiers résultant de :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>l'utilisation du Service ;</li>
                    <li>la présence de Documents illicites ou portant atteinte aux droits de tiers.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 13. Suspension et résiliation */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                13. Suspension et résiliation
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">13.1. Suspension par Verebona</p>
                  <p>Verebona peut suspendre immédiatement et sans préavis l'accès d'un Utilisateur au Service en cas :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>de suspicion de fraude ou de tentative d'accès non autorisé ;</li>
                    <li>de non-respect manifeste des CGSU ;</li>
                    <li>de défaut de paiement pour une Offre Payante ;</li>
                    <li>de risque avéré pour la sécurité du Service ou des autres utilisateurs ;</li>
                    <li>de signalement ou de suspicion sérieuse de contenus illicites.</li>
                  </ul>
                  <p className="mt-2">Verebona informera l'Utilisateur de la mesure de suspension par tout moyen utile.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">13.2. Résiliation par l'Utilisateur</p>
                  <p>L'Utilisateur peut résilier son abonnement à une Offre Payante à tout moment depuis son Compte, la résiliation prenant effet à la fin de la période en cours, sauf disposition contraire spécifique.</p>
                  <p className="mt-2">En cas de modification tarifaire notifiée conformément à l’article 9.2, l’Utilisateur peut résilier avant le renouvellement, la résiliation prenant effet à la fin de la période en cours.</p>
                  <p className="mt-2">L'Utilisateur peut également demander la suppression définitive de son Compte, ce qui entraîne la suppression ou l'anonymisation des Données dans les conditions prévues à l'article 14.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">13.3. Résiliation par Verebona</p>
                  <p>Verebona peut résilier le Compte de l'Utilisateur, moyennant un préavis raisonnable, en cas :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>de cessation du Service ;</li>
                    <li>ou de manquement grave ou répété de l'Utilisateur aux CGSU, après mise en demeure restée sans effet.</li>
                  </ul>
                  <p className="mt-2">En cas de manquement particulièrement grave (fraude caractérisée, atteinte majeure à la sécurité, etc.), la résiliation pourra intervenir sans préavis.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">13.4. Effets de la résiliation</p>
                  <p>En cas de résiliation du Compte :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>l'accès au Service est interrompu ;</li>
                    <li>dans la mesure du possible, l'Utilisateur est invité à récupérer ses Documents avant la date effective de clôture.</li>
                  </ul>
                  <p className="mt-2">Sauf obligation légale de conservation, Verebona pourra supprimer l'ensemble des Données et Documents de l'Utilisateur dans un délai maximum de soixante (60) jours suivant la clôture du Compte.</p>
                  <p className="mt-2">Certaines traces peuvent subsister de manière temporaire dans les systèmes de sauvegarde, sans être accessibles en production, pour la durée strictement nécessaire à la gestion desdites sauvegardes.</p>
                </div>
              </div>
            </section>

            {/* 14. Données à caractère personnel */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                14. Données à caractère personnel
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Verebona traite des données à caractère personnel dans le cadre du Service, en qualité de responsable de traitement au sens du RGPD.</p>
                <p>Les traitements de données à caractère personnel couvrent notamment :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>la gestion des Comptes Utilisateurs et des Offres (Gratuite et Payantes) ;</li>
                  <li>la fourniture du Service, y compris le stockage et le traitement technique des Documents (cf. article 8) ;</li>
                  <li>la gestion de la facturation et du paiement ;</li>
                  <li>la sécurité et la maintenance du Service ;</li>
                  <li>le cas échéant, la communication d'informations relatives au Service et à ses évolutions.</li>
                </ul>
                <p className="mt-3">
                  Les modalités détaillées de ces traitements (catégories de données, finalités, bases légales, durées de conservation, destinataires, transferts hors Union européenne, droits des personnes concernées, etc.) sont décrites dans la{" "}
                  <Link href="/politique-confidentialite" className="text-[color:var(--accent)] hover:underline">
                    Politique de confidentialité de Verebona
                  </Link>
                  , accessible sur le Site.
                </p>
                <p>L'Utilisateur est invité à en prendre connaissance. En utilisant le Service, l'Utilisateur reconnaît avoir pris connaissance de cette Politique de confidentialité.</p>
              </div>
            </section>

            {/* 15. Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                15. Propriété intellectuelle
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">15.1. Sur le Site et le Service</p>
                  <p>La structure générale du Site et du Service, ainsi que les contenus édités par Verebona (textes, graphiques, logos, marques, interfaces, logiciels, etc.) sont protégés par le droit d'auteur, le droit des marques et autres droits de propriété intellectuelle.</p>
                  <p className="mt-2">Sous réserve des droits expressément concédés à l'Utilisateur, aucun droit de propriété intellectuelle n'est transféré à ce dernier.</p>
                  <p className="mt-2">Toute reproduction, représentation, modification, adaptation, diffusion ou exploitation non autorisée est interdite.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">15.2. Sur les Documents de l'Utilisateur</p>
                  <p>L'Utilisateur conserve ses droits sur les Documents qu'il téléverse.</p>
                  <p className="mt-2">Pour les seuls besoins techniques du Service, l'Utilisateur concède à Verebona une licence non exclusive, mondiale, gratuite, pour la durée de l'hébergement des Documents, aux seules fins :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>d'héberger, stocker et sauvegarder les Documents ;</li>
                    <li>de permettre la consultation, l'organisation et l'export des Documents via le Service ;</li>
                    <li>le cas échéant, de permettre l'extraction automatisée d'informations conformément à l'article 8.</li>
                  </ul>
                  <p className="mt-2">Cette licence prend fin à la suppression définitive des Documents ou du Compte, sous réserve des contraintes techniques de sauvegarde et des obligations légales de conservation.</p>
                </div>
              </div>
            </section>

            {/* 16. Services et liens tiers */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                16. Services et liens tiers
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Le Service peut intégrer ou renvoyer vers des services ou contenus de tiers (hébergeur, prestataire de paiement, outils d'analyse, liens externes, etc.).</p>
                <p>Verebona n'est pas responsable du contenu, du fonctionnement ni de la sécurité de ces services tiers, qui sont soumis à leurs propres conditions d'utilisation et politiques de confidentialité.</p>
                <p>L'Utilisateur est invité à prendre connaissance des conditions d'utilisation et politiques de confidentialité de ces tiers avant de les utiliser.</p>
              </div>
            </section>

            {/* 17. Preuve et archivage */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                17. Preuve et archivage
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Les enregistrements informatiques conservés dans les systèmes de Verebona dans des conditions raisonnables de sécurité seront considérés comme preuves des communications, inscriptions, commandes et paiements intervenus entre l'Utilisateur et Verebona.</p>
                <p>Les notifications relatives aux évolutions tarifaires sont réputées effectuées à la date d’envoi de l’email ou de mise à disposition de l’information dans le Compte.</p>
                <p>Verebona procède à l'archivage des contrats conclus avec les Utilisateurs dans les conditions légales applicables et fournit, sur demande, les éléments nécessaires au Consommateur pour exercer ses droits dans les limites prévues par la loi.</p>
              </div>
            </section>

            {/* 18. Droit applicable – Litiges – Médiation */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                18. Droit applicable – Litiges – Médiation
              </h2>
              <div className="space-y-4 text-[color:var(--text-muted)] leading-relaxed">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">18.1. Droit applicable</p>
                  <p>Les présentes CGSU sont régies par le droit français.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">18.2. Litiges</p>
                  <p>En cas de litige relatif à l'interprétation ou à l'exécution des CGSU, Verebona et l'Utilisateur s'efforceront de trouver une solution amiable.</p>
                  <p className="mt-2">À défaut d'accord amiable dans un délai raisonnable, le litige sera soumis aux tribunaux français compétents, sans préjudice des droits impératifs reconnus au Consommateur par la loi applicable.</p>
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text-primary)] mb-2">18.3. Médiation de la consommation (Utilisateurs Consommateurs)</p>
                  <p>Lorsque l'Utilisateur a la qualité de Consommateur, il est informé qu'il peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable de tout litige l'opposant à Verebona.</p>
                  <p className="mt-2">Verebona a désigné le médiateur suivant :</p>
                  <div className="ml-4 mt-2 space-y-1 font-medium">
                    <p>[Nom du médiateur de la consommation]</p>
                    <p>[Adresse postale]</p>
                    <p>[Site / formulaire de saisine]</p>
                  </div>
                  <p className="mt-2">Les modalités pratiques de saisine du médiateur sont précisées sur le Site.</p>
                  <p className="mt-2">L'Utilisateur peut également recourir à la plateforme européenne de règlement en ligne des litiges, accessible via le site de la Commission européenne.</p>
                </div>
              </div>
            </section>

            {/* 19. Force majeure */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                19. Force majeure
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Aucune des parties ne pourra être tenue responsable d'un manquement à l'une quelconque de ses obligations qui résulterait d'un cas de force majeure au sens du Code civil et de la jurisprudence française, comprenant notamment, sans que cette liste soit exhaustive : pannes générales de réseau, attaques informatiques de grande ampleur, pannes majeures chez les prestataires d'hébergement ou de télécommunications, catastrophes naturelles, actes de guerre, émeutes, grèves généralisées.</p>
                <p>Les obligations de la partie empêchée sont suspendues pendant la durée du cas de force majeure. Si la situation de force majeure se prolonge au-delà de soixante (60) jours, chacune des parties pourra résilier le contrat de plein droit, sans indemnité de part et d'autre, par notification écrite.</p>
              </div>
            </section>

            {/* 20. Dispositions diverses et contact */}
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
                20. Dispositions diverses et contact
              </h2>
              <div className="text-[color:var(--text-muted)] leading-relaxed space-y-3">
                <p>Verebona peut céder tout ou partie de ses droits et obligations au titre des présentes CGSU à tout tiers de son choix, notamment dans le cadre d'une opération de restructuration, fusion, acquisition ou cession d'activité, sous réserve d'en informer l'Utilisateur par tout moyen utile.</p>
                <p>Si une clause des CGSU devait être déclarée nulle ou inapplicable, elle serait réputée non écrite, sans affecter la validité des autres dispositions.</p>
                <p>Le fait pour Verebona de ne pas se prévaloir d'un manquement de l'Utilisateur à l'une quelconque de ses obligations ne saurait être interprété comme une renonciation à l'obligation en cause.</p>
                <p>En cas de traduction des présentes CGSU, la version française prévaudra en cas de contradiction.</p>
                <p className="mt-4">Pour toute question relative au Service ou aux CGSU, l'Utilisateur peut contacter Verebona :</p>
                <p className="ml-4">
                  par email :{" "}
                  <a href="mailto:contact@verebona.com" className="text-[color:var(--accent)] hover:underline">
                    contact@verebona.com
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
