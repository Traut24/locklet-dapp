import { Box, Circle, Heading, HStack, Image, Link, SimpleGrid, Skeleton, SkeletonCircle } from '@chakra-ui/react';
import { Contract } from '@ethersproject/contracts';
import ERC20 from 'contracts/ERC20.json';
import { getAddress } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { FaFileContract } from 'react-icons/fa';
import { useHistory, useParams } from 'react-router';
import AllTokenLocks from 'src/components/Locks/AllTokenLocks';
import YourTokenLocks from 'src/components/Locks/YourTokenLocks';
import TokenChart from 'src/components/Tokens/TokenChart';
import TokenOverview from 'src/components/Tokens/TokenOverview';
import { useActiveWeb3React } from 'src/hooks';
import useTokensMetadata from 'src/hooks/useTokensMetadata';
import { getExplorerLink, isAddress } from 'src/utils';

export default function TokenPage() {
  // app state
  const { chainId, library } = useActiveWeb3React();

  const tokensMetadata = useTokensMetadata();

  // params
  const { tokenAddress } = useParams();

  const checksumAddress = useMemo(() => {
    if (isAddress(tokenAddress)) return getAddress(tokenAddress);
    else return false;
  }, [tokenAddress]);

  // component state
  const [isLoading, setIsLoading] = useState(true);
  const [tokenInfos, setTokenInfos] = useState(null);

  const refreshTokenInfos = async () => {
    const tokenContract = new Contract(checksumAddress, ERC20.abi, library);

    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const tokenDecimals = await tokenContract.decimals();
    const tokenTotalSupply = await tokenContract.totalSupply();

    let tokenLogoUrl = null;

    const trustWalletInfos = tokensMetadata?.find((x) => x.address?.toLowerCase() == tokenAddress?.toLowerCase());
    if (trustWalletInfos) tokenLogoUrl = trustWalletInfos.logoURI;

    setTokenInfos({ tokenAddress, tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply, tokenLogoUrl });
    setIsLoading(false);
  };

  useEffect(() => {
    if (!checksumAddress) history.pushState('/home');
    refreshTokenInfos();
  }, [chainId, checksumAddress, tokensMetadata]);

  return (
    <Box as="section" pt="6" bg="inherit">
      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <Box overflowX="auto">
          <HStack verticalAlign="center" mb="1">
            {tokenInfos?.tokenLogoUrl && (
              <Circle rounded="full" size="8">
                <Image src={tokenInfos.tokenLogoUrl} />
              </Circle>
            )}
            <Heading fontWeight="semibold" size="lg">
              <Skeleton rounded="md" width={isLoading && '200px'} isLoaded={!isLoading}>
                {tokenInfos?.tokenName} <small>({tokenInfos?.tokenSymbol})</small>
              </Skeleton>
            </Heading>
          </HStack>

          <HStack mb="4">
            <FaFileContract />
            <Link href={getExplorerLink(chainId, checksumAddress, 'token')} color="brand.500" fontWeight="medium" isExternal>
              {checksumAddress}
            </Link>
          </HStack>

          <SimpleGrid columns={2} spacing={6}>
            <TokenOverview tokenInfos={tokenInfos}  />
            <TokenChart tokenAddress={checksumAddress} />
          </SimpleGrid>
        </Box>
      </Box>

      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <Box overflowX="auto">
          <Heading fontWeight="semibold" size="lg" mb="4">
            LKT Token Locks
          </Heading>

          <AllTokenLocks />
        </Box>
      </Box>
    </Box>
  );
}
