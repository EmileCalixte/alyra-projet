# Alyra projet

## Lancement du projet

```sh
docker compose up
```

Lors du démarrage, les dépendances NPM sont installées si nécessaire et la blockchain de développement hardhat est lancée.

> Pour exécuter des commandes dans le container, par exemple pour compiler ou lancer les tests, il faudra les précéder de `docker compose exec hardhat <commande>`.

## Tests automatisés

Les tests automatisés se lancent avec la commande suivante

```sh
docker compose exec hardhat npx hardhat test
```

<details>
    <summary>Détails des tests</summary>

    - Ajout de voters
        - Vérification que l'ajout de voter fonctionne
        - Vérification qu'une adresse autre que l'owner ne peut pas ajouter de voter
            - Même si l'adresse en question est elle-même un voter
        - Vérification qu'un event `VoterRegistered` est émis
        - Vérification que l'ajout d'un voter est impossible lorsque la période d'ajout de voters est close
        - Vérification que la transaction revert lorsque l'adresse à enregistrer est déjà un voter
    - Ajout de propositions
        - Vérification qu'une proposition "GENESIS" est ajoutée lors de l'ouverture de la session d'ajout de propositions
        - Vérification que l'ajout d'une proposition par un voter enregistré fonctionne
        - Vérification que la transaction revert lorsque l'on ajoute une proposition sans description
        - Vérification que la transaction revert lorsqu'une adresse qui n'est pas enregistrée comme voter tente d'ajouter une proposition
        - Vérification que l'ajout d'une proposition n'est possible que pendant la session d'enregistrement des propositions
        - Vérification qu'un event `ProposalRegistered` est émis
    - Vote
        - Vérification que la soumission d'un vote fonctionne
        - Vérification qu'une adresse qui n'est pas un voter ne peut pas voter
        - Vérification qu'un voter qui a déjà voté ne peut pas voter à nouveau
        - Vérification que la transaction revert si on tente de voter pour une proposition qui n'existe pas
        - Vérification que l'on ne peut voter que pendant la phase de vote
        - Vérification qu'un event `Voted` est émis
    - Dépouillement des votes
        - Vérification que la transaction revert si la session de votes n'est pas terminée
        - Vérification que le dépouillement des votes fonctionne
        - Vérification qu'une adresse qui n'est pas owner ne peut pas déclencher le dépouillement des votes
        - Vérification qu'un événement `WorkflowStatusChange` est émis
</details>

## Compilation et déploiement

Compiler les smart contracts :

```sh
docker compose exec hardhat npx hardhat compile
```

Exécuter le script de déploiement :

```sh
docker compose exec hardhat npx hardhat run scripts/deploy.ts
```

## Objectif

Un smart contract de vote pour une petite organisation. Les électeurs, que l'organisation connaît tous, sont inscrits sur une whitelist grâce à leur adresse Ethereum. Ils peuvent soumettre de nouvelles propositions lors d'une session d'enregistrement des propositions, et peuvent voter sur les propositions lors de la session de vote.

- Le vote n'est pas secret pour les utilisateurs ajoutés à la whitelist
- Chaque électeur peut voir les votes des autres
- Le gagnant est déterminé à la majorité simple
- La proposition qui obtient le plus de voix l'emporte

### Processus de vote

- L'administrateur du vote enregistre une liste blanche d'électeurs identifiés par leur adresse Ethereum
- L'administrateur du vote commence la session d'enregistrement de la proposition
- Les électeurs inscrits sont autorisés à enregistrer leurs propositions pendant que la session d'enregistrement est active
- L'administrateur du vote met fin à la session d'enregistrement des propositions, puis commence la session de vote
- Les électeurs inscrits votent pour leur proposition préférée
- L'administrateur du vote met fin à la session de vote
- L'administrateur du vote comptabilise les votes
- Tout le monde peut vérifier les derniers détails de la proposition gagnante

## Exigences

- Le smart contract doit s'appeler `Voting`
- Le smart contract doit utiliser la dernière version du compilateur
- L'administrateur est celui qui va déployer le smart contract
- Le smart contract doit définir les structures de données suivantes :  
```solidity
struct Voter {
    bool isRegistered;
    bool hasVoted;
    uint votedProposalId;
}

struct Proposal {
    string description;
    uint voteCount;
}
```
- Le smart contract doit définir une énumération qui gère les différents états d'un vote :
```solidity
enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
}
```
- Le smart contract doit définir une variable `uint winningProposalId` qui représente l'id de la proposition gagnante ou une fonction `getWinner` qui retourne le gagnant
- Le smart contract doit importer [le smart contract `Ownable` d'OpenZepplin](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol)
- Le smart contract doit définir les événements suivants :
```solidity
event VoterRegistered(address VoterAddress);
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
event ProposalRegistered(uint proposalId);
event Voted(address voter, uint proposalId);
```
