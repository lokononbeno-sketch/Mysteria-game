export function createMissions(){
  const list=[
    {title:'Découverte du centre-ville',text:'Rejoins la place centrale et repère les bâtiments officiels.',x:18,z:-17,reward:500},
    {title:'Livraison au marché Ouando',text:'Conduis le colis jusqu’au marché et ses étals colorés.',x:-20,z:20,reward:1200},
    {title:'Course de zemidjan',text:'Récupère une moto et rejoins le carrefour animé.',x:26,z:25,reward:1500},
    {title:'Le chemin de la lagune',text:'Traverse la ville et atteins le point de vue sur l’eau.',x:48,z:42,reward:1800},
    {title:'Visite du quartier historique',text:'Explore les maisons à véranda et rejoins le repère patrimonial.',x:-42,z:-38,reward:1000},
    {title:'Transport de passager',text:'Prends une voiture ou une moto et rejoins le point de rendez-vous.',x:0,z:-48,reward:1600},
    {title:'Approvisionnement',text:'Récupère les provisions au marché puis livre-les au quartier voisin.',x:40,z:-22,reward:1900},
    {title:'Patrouille urbaine',text:'Fais le tour des grands carrefours et rejoins le dernier repère.',x:-48,z:12,reward:2200},
    {title:'Balade au coucher du soleil',text:'Termine le parcours en rejoignant la promenade.',x:0,z:48,reward:2500}
  ];let i=0,completed=0;
  return {current:()=>list[i],check(p){const m=list[i];if(Math.hypot(p.x-m.x,p.z-m.z)<3.2){completed++;i=(i+1)%list.length;return m.reward}return 0},progress:()=>completed,total:()=>list.length};
}