# Alyra projet

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