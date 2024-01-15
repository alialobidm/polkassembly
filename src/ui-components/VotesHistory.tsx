// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import StatusTag from './StatusTag';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IProfileVoteHistoryRespose, IVotesData } from 'pages/api/v1/votesHistory/getVotesByVoter';
import { Empty, Spin, Checkbox, Pagination as AntdPagination } from 'antd';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { noTitle } from '~src/global/noTitle';
import Link from 'next/link';
import Address from './Address';
import ExpandIcon from '~assets/icons/expand-small-icon.svg';
import AyeIcon from '~assets/icons/aye-green-icon.svg';
import NayIcon from '~assets/icons/profile-nay.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import { poppins } from 'pages/_app';
import { EGovType } from '~src/types';
import { MinusCircleFilled } from '@ant-design/icons';
import { formatBalance } from '@polkadot/util';
import { useNetworkSelector } from '~src/redux/selectors';
import Popover from '~src/basic-components/Popover';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import Image from 'next/image';
import VoteHistoryExpandModal from './VoteHistoryExpandModal';
import { ProfileDetailsResponse } from '~src/auth/types';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
	theme?: string;
}

const Pagination = styled(AntdPagination)`
	a {
		color: ${(props) => (props.theme === 'dark' ? '#fff' : '#212121')} !important;
	}
	.ant-pagination-item-active {
		background-color: ${(props) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.anticon-right {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.anticon-left {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
`;

const getOrderBy = (sortByPostIndex: boolean) => {
	const orderBy = [];
	orderBy.push(!sortByPostIndex ? 'proposalIndex_DESC' : 'proposalIndex_ASC');
	return orderBy;
};

enum EHeading {
	VOTE = 'Vote',
	PROPOSAL = 'Proposal',
	STATUS = 'Status',
	ACTIONS = 'Actions'
}

const VotesHistory = ({ className, userProfile, theme }: Props) => {
	// const { id } = useUserDetailsSelector();
	const { addresses } = userProfile;
	const { network } = useNetworkSelector();
	const headings = [EHeading.PROPOSAL, EHeading.VOTE, EHeading.STATUS, EHeading.ACTIONS];
	const [votesData, setVotesData] = useState<IVotesData[] | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [delegatorsLoading, setDelegatorsLoading] = useState<boolean>(false);
	const [sortByPostIndex, setSortByPostIndex] = useState<boolean>(false);
	const [checkedAddressList, setCheckedAddressList] = useState<CheckboxValueType[]>(addresses as CheckboxValueType[]);
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);
	const [govTypeExpand, setgovTypeExpand] = useState(false);
	const [openVoteDataModal, setOpenVoteDataModal] = useState(false);
	const [expandViewVote, setExpandViewVote] = useState<IVotesData | null>(null);

	const [selectedGov, setSelectedGov] = useState(isOpenGovSupported(network) ? EGovType.OPEN_GOV : EGovType.GOV1);

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={(list) => setCheckedAddressList(list)}
				value={checkedAddressList}
			>
				{addresses?.map((address, index) => (
					<div
						className={`${poppins.variable} ${poppins.className} flex gap-[13px] p-[8px] text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
						key={index}
					>
						<Checkbox
							className='text-pink_primary'
							value={address}
						/>
						<Address
							address={address}
							isTruncateUsername={false}
							displayInline
							disableAddressClick
						/>
					</div>
				))}
			</Checkbox.Group>
		</div>
	);

	const govTypeContent = (
		<div className='flex w-[110px] flex-col gap-4'>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setSelectedGov(EGovType.GOV1)}
			>
				Gov1
			</span>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setSelectedGov(EGovType.OPEN_GOV)}
			>
				OpenGov
			</span>
		</div>
	);
	const handleVoteHistoryData = async () => {
		setVotesData(null);
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IProfileVoteHistoryRespose[]; totalCount: number }>('api/v1/votesHistory/getVotesByVoter', {
			orderBy: getOrderBy(sortByPostIndex),
			page,
			type: selectedGov === EGovType.OPEN_GOV ? 'ReferendumV2' : 'Referendum',
			voterAddresses: checkedAddressList || []
		});
		if (data) {
			setVotesData(data?.data);
			setTotalCount(data?.totalCount);
		} else {
			console.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (!addresses.length) {
			setVotesData([]);
			return;
		}
		handleVoteHistoryData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, addresses, sortByPostIndex, checkedAddressList, selectedGov]);

	const handleDelegatesAndCapital = async (index: number, filteredVote: IVotesData) => {
		if ((filteredVote?.delegatorsCount && filteredVote?.delegateCapital) || filteredVote?.isDelegatedVote) return;
		setDelegatorsLoading(true);

		const { data, error } = await nextApiClientFetch<{ count: number; voteCapital: string }>(
			`api/v1/votes/delegationVoteCountAndPower?postId=${filteredVote?.proposal?.id}&decision=${filteredVote?.decision || 'yes'}&type=${
				selectedGov === EGovType.OPEN_GOV ? 'ReferendumV2' : 'Referendum'
			}&voter=${filteredVote?.voter}`
		);
		if (data) {
			const newData = votesData?.map((vote, idx) => {
				if (index === idx) {
					return { ...vote, delegateCapital: data?.voteCapital, delegatorsCount: data?.count };
				}
				return vote;
			});
			setVotesData(newData || votesData);
			setExpandViewVote({ ...filteredVote, delegateCapital: data?.voteCapital, delegatorsCount: data?.count });
		} else {
			console.log(error);
		}
		setDelegatorsLoading(false);
	};

	const handleExpand = (index: number, vote: IVotesData) => {
		setOpenVoteDataModal(true);
		setExpandViewVote(vote);
		handleDelegatesAndCapital(index, vote);
	};
	const handleSortingClick = (heading: EHeading) => {
		if (heading === EHeading.STATUS || heading === EHeading.VOTE) return;
		setSortByPostIndex(!sortByPostIndex);
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<div className='rounded-[18px] border-[1px] border-solid border-[#DCDFE3] bg-white pb-10 dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-medium max-md:px-4'>
			<div className={`flex items-center justify-between gap-4 p-6 max-md:px-0 ${addresses.length > 1 && 'max-md:flex-col'}`}>
				<div className='flex w-full items-center gap-2 text-xl font-medium max-md:justify-start'>
					<Image
						src={theme === 'dark' ? '/assets/profile/profile-votes-dark.svg' : '/assets/profile/profile-votes.svg'}
						alt=''
						width={28}
						height={28}
					/>
					<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>
						Votes
						<span className='flex items-end text-sm font-normal'>({totalCount})</span>
					</div>
				</div>
				<div className='flex gap-4'>
					{addresses.length > 1 && (
						<div className=''>
							<Popover
								zIndex={1056}
								content={content}
								placement='bottom'
								onOpenChange={() => setAddressDropdownExpand(!addressDropdownExpand)}
							>
								<div className='flex h-10 w-[180px] items-center justify-between rounded-md border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-sm font-medium capitalize text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
									Select Addresses
									<span className='flex items-center'>
										<DownArrowIcon className={`cursor-pointer ${addressDropdownExpand && 'pink-color rotate-180'}`} />
									</span>
								</div>
							</Popover>
						</div>
					)}
					{isOpenGovSupported(network) && (
						<div className=''>
							<Popover
								zIndex={1056}
								content={govTypeContent}
								placement='bottom'
								onOpenChange={() => setgovTypeExpand(!govTypeExpand)}
							>
								<div className='flex h-10 w-[130px] items-center justify-between rounded-md border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-sm font-medium capitalize text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
									{selectedGov.split('_').join(' ')}
									<span className='flex items-center'>
										<DownArrowIcon className={`cursor-pointer ${govTypeExpand && 'pink-color rotate-180'}`} />
									</span>
								</div>
							</Popover>
						</div>
					)}
				</div>
			</div>
			<Spin
				className={`${className} w-full`}
				spinning={loading}
			>
				{votesData && votesData?.length > 0 && !loading ? (
					<div className={`flex max-w-[100%] flex-shrink-0 flex-col overflow-x-auto overflow-y-hidden ${className}`}>
						<div className='flex h-14 items-center justify-between gap-2 border-0 border-y-[1px] border-solid border-[#DCDFE3] bg-[#FBFBFC] px-6 dark:border-separatorDark dark:bg-[#161616] max-md:hidden'>
							{headings.map((heading, index) => (
								<span
									onClick={() => handleSortingClick(heading as EHeading)}
									className={`flex items-center text-sm font-medium text-lightBlue dark:text-blue-dark-medium ${
										heading === EHeading.PROPOSAL ? 'w-[40%] ' : heading === EHeading.VOTE ? 'w-[30%]' : heading === EHeading.ACTIONS ? 'w-[10%]' : 'w-[15%]'
									}`}
									key={index}
								>
									{heading}
									{heading === EHeading.PROPOSAL && (
										<ExpandIcon className={heading === EHeading.PROPOSAL && !!sortByPostIndex ? 'ml-1 rotate-180 cursor-pointer' : 'ml-1 cursor-pointer'} />
									)}
								</span>
							))}
						</div>
						<div className='max-md:flex max-md:flex-col max-md:gap-4'>
							{votesData &&
								votesData?.map((vote, index) => (
									<div
										className={'border-[#DCDFE3] text-sm text-bodyBlue dark:text-blue-dark-high max-md:rounded-[14px] max-md:border-[1px] max-md:border-solid '}
										key={index}
									>
										<div
											className={`border-0 ${
												!loading && 'border-b-[1px]'
											} border-solid border-[#DCDFE3] text-sm text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high max-md:border-none `}
										>
											<div className='flex h-14 items-center justify-between border-0 px-6 max-md:border-b-[1px] max-md:border-solid max-md:border-[#DCDFE3]'>
												<Link
													target='_blank'
													href={`https:${network}.polkassembly.io/${selectedGov === EGovType.OPEN_GOV ? 'referenda' : 'referendum'}/${vote?.proposal?.id}`}
													className='flex w-[40%] truncate font-medium text-bodyBlue hover:text-bodyBlue dark:text-blue-dark-high max-md:w-[95%]'
												>
													<span className='flex w-[60px] items-center gap-1 '>
														{`#${vote?.proposal?.id}`}
														<span className='text-[9px] text-bodyBlue dark:text-blue-dark-high'>&#9679;</span>
													</span>
													<span className='w-[100%] truncate hover:underline '>{vote?.proposal?.title || noTitle}</span>
												</Link>
												<div className='flex w-[30%] gap-10 max-md:hidden'>
													{vote?.decision === 'yes' ? (
														<span className='text-[#2ED47A]'>
															<AyeIcon className='mr-1' />
														</span>
													) : vote?.decision === 'no' ? (
														<span className='text-[#F53C3C]'>
															<NayIcon className='mr-1' />
														</span>
													) : (
														<span className='text-[#407BFF]'>
															<MinusCircleFilled className='mr-1' />
														</span>
													)}
													<div className='flex w-[40%] justify-between gap-6'>
														<span className='flex-shrink-0'>
															{formatedBalance((vote?.balance.toString() || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
														</span>
														<span>
															{vote?.lockPeriod ? vote?.lockPeriod : 0.1}x{vote.isDelegatedVote && '/d'}
														</span>
													</div>
												</div>
												<span className='flex w-[15%] justify-start max-md:hidden'>
													<StatusTag
														theme={theme}
														status={vote?.proposal?.status}
														className='truncate max-lg:w-[80px]'
													/>
												</span>
												<span className='w-[10%]'>
													<div className='flex w-[10%] justify-start gap-4'>
														{/* <Image
															src={'/assets/profile/profile-subscan.svg'}
															height={20}
															width={20}
															alt=''
															className='cursor-pointer max-md:hidden'
														/> */}
														<span onClick={() => handleExpand(index, vote)}>
															<Image
																src={'/assets/profile/view-votes.svg'}
																height={24}
																width={24}
																alt=''
																className='cursor-pointer'
															/>
														</span>
														{/* TODO remove vote funtionality */}
														{/* {userProfile.user_id === id && (
															<span>
																<Image
																	src={'/assets/profile/remove-vote.svg'}
																	height={24}
																	width={24}
																	alt=''
																	className='cursor-pointer max-md:hidden'
																/>
															</span>
														)} */}
													</div>
												</span>
											</div>
											<div className='flex justify-between px-6 py-4 md:hidden'>
												<div className='flex w-[50%] items-center justify-between gap-2 max-sm:w-[70%]'>
													{vote?.decision === 'yes' ? (
														<span className='flex items-center justify-end text-[#2ED47A]'>
															<AyeIcon className='mr-1' />
															Aye
														</span>
													) : (
														<span className='flex items-center justify-end text-[#F53C3C]'>
															<NayIcon className='mr-1' />
															Nay
														</span>
													)}
													<span className='flex justify-end'>
														{formatedBalance((vote?.balance.toString() || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
													</span>
													<span>
														{vote?.lockPeriod ? vote?.lockPeriod : 0.1}x{vote.isDelegatedVote && '/d'}
													</span>
												</div>
												<StatusTag
													theme={theme}
													status={vote?.proposal?.status}
													className='truncate max-sm:w-[90px] max-xs:w-[70px]'
												/>
											</div>
										</div>
									</div>
								))}
						</div>
						<div className='mt-4 flex w-full items-center justify-center'>
							<Pagination
								theme={theme}
								defaultCurrent={1}
								current={page}
								pageSize={LISTING_LIMIT}
								total={totalCount}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={(page: number) => setPage(page)}
								responsive={true}
							/>
						</div>
					</div>
				) : (
					<div className='mt-16'>{votesData && <Empty />}</div>
				)}
			</Spin>
			<VoteHistoryExpandModal
				open={openVoteDataModal}
				setOpen={setOpenVoteDataModal}
				expandViewVote={expandViewVote}
				setExpandViewVote={setExpandViewVote}
				delegatorsLoading={delegatorsLoading}
			/>
		</div>
	);
};

export default styled(VotesHistory)`
	.ant-collapse {
		border-radius: 0px !important;
		border: none !important;
		background: transparent !important;
	}
	.pink-color {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
