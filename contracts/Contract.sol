//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//  ███████╗███╗   ██╗███████╗ ██████╗    ██╗  ████████╗██████╗
//  ██╔════╝████╗  ██║██╔════╝██╔═══██╗   ██║  ╚══██╔══╝██╔══██╗
//  █████╗  ██╔██╗ ██║███████╗██║   ██║   ██║     ██║   ██║  ██║
//  ██╔══╝  ██║╚██╗██║╚════██║██║   ██║   ██║     ██║   ██║  ██║
//  ███████╗██║ ╚████║███████║╚██████╔╝██╗███████╗██║   ██████╔╝
//  ╚══════╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═╝   ╚═════╝

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract Contract is
    Ownable,
    ERC721,
    ERC721Enumerable,
    ERC721Royalty,
    ERC721Burnable
{
    using Address for address payable;

    bool private _metadataLock;

    string private _name;
    string private _symbol;

    string private _storedContractURI;
    string private _storedBaseURI;

    uint256 private _collectibleSupply;
    uint256 private _maxCollectibleSupply;
    uint256 private _maxMintAmount;

    bool private _mintable;
    uint256 private _mintPrice;

    bool private _whitelistMintable;
    uint256 private _whitelistMintPrice;

    mapping(address => uint256) private _whitelist;
    mapping(address => uint256) private _whitelistFree;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory storedContractURI_,
        string memory storedBaseURI_,
        uint256 maxCollectibleSupply_,
        uint256 maxMintAmount_,
        bool[] memory mintables_,
        uint256[] memory mintPrices_,
        address royaltyReceiver_,
        uint96 royaltyFeeNumerator_
    ) ERC721(name_, symbol_) {
        _name = name_;
        _symbol = symbol_;

        _storedContractURI = storedContractURI_;
        _storedBaseURI = storedBaseURI_;

        _maxCollectibleSupply = maxCollectibleSupply_;
        _maxMintAmount = maxMintAmount_;

        _mintable = mintables_[0];
        _whitelistMintable = mintables_[1];

        _mintPrice = mintPrices_[0];
        _whitelistMintPrice = mintPrices_[1];

        _setDefaultRoyalty(royaltyReceiver_, royaltyFeeNumerator_);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return
            ERC721Enumerable.supportsInterface(interfaceId) ||
            ERC721Royalty.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return string(bytes.concat(bytes(ERC721.tokenURI(id)), bytes(".json")));
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721Royalty) {
        ERC721Royalty._burn(tokenId);
    }

    receive() external payable {
        // Accept payments, this is useful for testing.
    }

    function lockMetadata() external onlyOwner {
        _metadataLock = true;
    }

    function metadataLock() public view returns (bool) {
        return _metadataLock;
    }

    modifier satisfyingMetadataLock() {
        require(!metadataLock(), "Metadata is locked!");

        _;
    }

    function setName(string memory name_)
        external
        satisfyingMetadataLock
        onlyOwner
    {
        _name = name_;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function setSymbol(string memory symbol_)
        external
        satisfyingMetadataLock
        onlyOwner
    {
        _symbol = symbol_;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function setContractURI(string memory storedContractURI_)
        external
        satisfyingMetadataLock
        onlyOwner
    {
        _storedContractURI = storedContractURI_;
    }

    function contractURI() external view returns (string memory) {
        return _storedContractURI;
    }

    function setBaseURI(string memory storedBaseURI_)
        external
        satisfyingMetadataLock
        onlyOwner
    {
        _storedBaseURI = storedBaseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _storedBaseURI;
    }

    function baseURI() external view returns (string memory) {
        return _baseURI();
    }

    function maxCollectibleSupply() public view returns (uint256) {
        return _maxCollectibleSupply;
    }

    function collectibleSupply() public view returns (uint256) {
        return _collectibleSupply;
    }

    function lowerMaxCollectibleSupply(uint256 maxCollectibleSupply_)
        external
        onlyOwner
    {
        require(
            _collectibleSupply <= maxCollectibleSupply_,
            "Cannot set max collectible supply lower than actual supply!"
        );

        _maxCollectibleSupply = maxCollectibleSupply_;
    }

    function setMintPrice(uint256 mintPrice_) external onlyOwner {
        _mintPrice = mintPrice_;
    }

    function setWhitelistMintPrice(uint256 whitelistMintPrice_)
        external
        onlyOwner
    {
        _whitelistMintPrice = whitelistMintPrice_;
    }

    function mintPrice() public view returns (uint256) {
        return _mintPrice;
    }

    function whitelistMintPrice() public view returns (uint256) {
        return _whitelistMintPrice;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function withdraw(address payable to) external onlyOwner {
        to.sendValue(address(this).balance);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function tokensOfOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(owner);

        if (tokenCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory result = new uint256[](tokenCount);
        uint256 index;

        for (index = 0; index < tokenCount; index++) {
            result[index] = tokenOfOwnerByIndex(owner, index);
        }

        return result;
    }

    function tokens() external view returns (uint256[] memory) {
        uint256 tokenCount = _collectibleSupply;

        if (tokenCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory result = new uint256[](tokenCount);
        uint256 index;

        for (index = 0; index < tokenCount; index++) {
            result[index] = tokenByIndex(index);
        }

        return result;
    }

    function setMintable(bool mintable) external onlyOwner {
        _mintable = mintable;
    }

    function setWhitelistMintable(bool whitelistMintable) external onlyOwner {
        _whitelistMintable = whitelistMintable;
    }

    function isMintable() public view returns (bool) {
        return _mintable;
    }

    function isWhitelistMintable() public view returns (bool) {
        return _whitelistMintable && !_mintable;
    }

    function isWhitelistFreeMintable() public view returns (bool) {
        return _whitelistMintable;
    }

    function _setWhitelist(address addr, uint256 spots) internal {
        _whitelist[addr] = spots;
    }

    function setWhitelist(address addr, uint256 spots) public onlyOwner {
        _setWhitelist(addr, spots);
    }

    function _setWhitelistFree(address addr, uint256 spots) internal {
        _whitelistFree[addr] = spots;
    }

    function setWhitelistFree(address addr, uint256 spots) public onlyOwner {
        _setWhitelistFree(addr, spots);
    }

    function batchSetWhitelist(
        address[] calldata addresses,
        uint256[] calldata spots
    ) external onlyOwner {
        require(
            addresses.length == spots.length,
            "Addresses and spots differ in length!"
        );

        for (uint256 i = 0; i < addresses.length; i++) {
            setWhitelist(addresses[i], spots[i]);
        }
    }

    function batchSetWhitelistFree(
        address[] calldata addresses,
        uint256[] calldata spots
    ) external onlyOwner {
        require(
            addresses.length == spots.length,
            "Addresses and spots differ in length!"
        );

        for (uint256 i = 0; i < addresses.length; i++) {
            setWhitelistFree(addresses[i], spots[i]);
        }
    }

    function whitelist(address addr) public view returns (uint256) {
        return _whitelist[addr];
    }

    function whitelistFree(address addr) public view returns (uint256) {
        return _whitelistFree[addr];
    }

    modifier satisfyingMintable() {
        require(isMintable(), "Minting is not active!");

        _;
    }

    modifier satisfyingWhitelistMintable() {
        require(isWhitelistMintable(), "Whitelist minting is not active!");

        _;
    }

    modifier satisfyingWhitelistFreeMintable() {
        require(isWhitelistFreeMintable(), "Whitelist minting is not active!");

        _;
    }

    modifier satisfyingMintPrice(uint256 amount) {
        require(
            amount * mintPrice() == msg.value,
            "Incorrect transaction value!"
        );

        _;
    }

    modifier satisfyingWhitelistMintPrice(uint256 amount) {
        require(
            amount * whitelistMintPrice() == msg.value,
            "Incorrect transaction value!"
        );

        _;
    }

    modifier satisfyingWhitelistSpots(uint256 amount) {
        require(amount <= whitelist(msg.sender), "Not enough whitelist spots!");

        _;
    }

    modifier satisfyingWhitelistFreeSpots(uint256 amount) {
        require(
            amount <= whitelistFree(msg.sender),
            "Not enough free mint whitelist spots!"
        );

        _;
    }

    modifier satisfyingMaxMintAmount(uint256 amount) {
        require(amount <= _maxMintAmount, "Maximum mint amount exceeded!");

        _;
    }

    modifier satisfyingMaxCollectibleSupply(uint256 amount) {
        // Note: Do not rely on the total supply function of ERC721Enumerable for the current
        // collectible supply. That function is affected by burning collectibles. This allows
        // collectible holders to brick ongoing minting by burning one of their collectibles.
        require(
            amount + collectibleSupply() <= maxCollectibleSupply(),
            "All NFTs are already minted!"
        );

        _;
    }

    function _batchMint(address to, uint256 amount)
        internal
        satisfyingMaxCollectibleSupply(amount)
        satisfyingMaxMintAmount(amount)
    {
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, _collectibleSupply + i);
        }

        _collectibleSupply += amount;
    }

    function batchMint(address to, uint256 amount)
        external
        payable
        satisfyingMintable
        satisfyingMintPrice(amount)
    {
        _batchMint(to, amount);
    }

    function batchWhitelistMint(address to, uint256 amount)
        external
        payable
        satisfyingWhitelistMintable
        satisfyingWhitelistSpots(amount)
        satisfyingWhitelistMintPrice(amount)
    {
        _batchMint(to, amount);

        _setWhitelist(msg.sender, whitelist(msg.sender) - amount);
    }

    function batchWhitelistFreeMint(address to, uint256 amount)
        external
        payable
        satisfyingWhitelistFreeMintable
        satisfyingWhitelistFreeSpots(amount)
    {
        _batchMint(to, amount);

        _setWhitelistFree(msg.sender, whitelistFree(msg.sender) - amount);
    }

    function airdropBatchMint(address to, uint256 amount) external onlyOwner {
        // This function useful for testing.
        _batchMint(to, amount);
    }
}
