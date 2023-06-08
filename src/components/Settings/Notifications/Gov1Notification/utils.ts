// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
const tips = [
	{
		label: 'New Tips submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'New Tips submitted'
	},
	{
		label: 'Tips opened',
		triggerName: 'gov1ProposalInVoting',
		triggerPreferencesName: 'gov1ProposalInVoting',
		value: 'Tips opened'
	},
	{
		label: 'Tips closed / retracted',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Tips closed / retracted'
	}
];

const techCommittee = [
	{
		label: 'New Tech Committe Proposals submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'New Tech Committe Proposals submitted'
	},
	{
		label: 'Proposals closed',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Proposals closed'
	}
];

const bounties = [
	{
		label: 'Bounties submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'Bounties submitted'
	},
	{
		label: 'Bounties closed',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Bounties closed'
	}
];

const childBounties = [
	{
		label: 'Child Bounties submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'Child Bounties submitted'
	},
	{
		label: 'Child Bounties closed',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Child Bounties closed'
	}
];

const referendumsV1 = [
	{
		label: 'New Referendum submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'New Referendum submitted'
	},
	{
		label: 'Referendum Voting',
		triggerName: 'gov1ProposalInVoting',
		triggerPreferencesName: 'gov1ProposalInVoting',
		value: 'Referendum Voting'
	},
	{
		label: 'Referendum closed',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Referendum closed'
	}
];

const proposal = [
	{
		label: 'New Proposal submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'New Proposal submitted'
	},
	{
		label: 'Proposal in Voting',
		triggerName: 'gov1ProposalInVoting',
		triggerPreferencesName: 'gov1ProposalInVoting',
		value: 'Proposal in Voting'
	},
	{
		label: 'Proposal closed',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Proposal closed'
	}
];

const councilMotion = [
	{
		label: 'New Motions submitted',
		triggerName: 'gov1ProposalSubmitted',
		triggerPreferencesName: 'gov1ProposalSubmitted',
		value: 'New Motions submitted'
	},
	{
		label: 'Motion in voting',
		triggerName: 'gov1ProposalInVoting',
		triggerPreferencesName: 'gov1ProposalInVoting',
		value: 'Motion in voting'
	},
	{
		label: 'Motion closed / retracted',
		triggerName: 'gov1ProposalClosed',
		triggerPreferencesName: 'gov1ProposalClosed',
		value: 'Motion closed / retracted'
	}
];

const allGov1 = {
	bounties,
	childBounties,
	councilMotion,
	proposal,
	referendumsV1,
	techCommittee,
	tips
};

const titleMapper = (title: string) => {
	switch (title) {
	case 'Tips': {
		return 'tips';
	}
	case 'Tech Committee': {
		return 'techCommittee';
	}
	case 'Bounties': {
		return 'bounties';
	}
	case 'Child Bounties': {
		return 'childBounties';
	}
	case 'Referendums': {
		return 'referendumsV1';
	}
	case 'Proposal': {
		return 'proposal';
	}
	case 'Council Motion': {
		return 'councilMotion';
	}
	}
};

export { techCommittee, tips, childBounties, bounties, proposal, referendumsV1, councilMotion, allGov1, titleMapper };