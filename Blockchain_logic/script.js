// MANUFACTURER FUNCTIONS
/**
 * Start an escrow
 * @param {org.acme.model.StartEscrow} startEscrow - the PlaceOrder transaction
 * @transaction
 */
function startEscrow(escrowRequest) {
  var factory = getFactory();
  var namespace = 'org.acme.model';
  var escrow = factory.newResource(namespace, 'Escrow', escrowRequest.escrowID);
  escrow.escrowID = escrowRequest.escrowID;
  escrow.status = 'STARTED'
  escrow.title = escrowRequest.title;
  escrow.buyerDeposit = 0
  escrow.buyerBankDeposit = 0
  escrow.buyerApproved = false
  escrow.buyerBankWithdrawn = false
  escrow.buyer = escrowRequest.buyer;
  escrow.seller = escrowRequest.seller;
  escrow.buyerBank = escrowRequest.buyerBank;
  escrow.sellerBank = escrowRequest.sellerBank;  
  
  //save the order
  return getAssetRegistry(escrow.getFullyQualifiedType())
    .then(function (assetRegistry) {
    return assetRegistry.add(escrow);
  })
    .then(function () {
    // emit the event
    var startEscrowEvent = factory.newEvent(namespace, 'StartEscrowEvent');
    startEscrowEvent.escrowID = escrow.escrowID;
    emit(startEscrowEvent);
  });
  return;
}

/**
 * Update the status of an escrow
 * @param {org.acme.model.BuyerApproved} BuyerApproved - the BuyerApproved transaction
 * @transaction
 */
function buyerApproved(escrowRequest) {
  if (escrowRequest.escrow.status == 'BUYER_BANK_DEPOSITED') {
    var factory = getFactory();
    var namespace = 'org.acme.model';1
    return getAssetRegistry(namespace + '.Escrow').then(function(escrowRegistry) {
      // update the order
      var escrow = escrowRequest.escrow;
      escrow.buyerApproved = true;
      escrow.status = 'BUYER_APPROVED';
      return escrowRegistry.update(escrow);
  	})
  }
  else
    throw new Error('Invalid Transaction'); 
  return;
}

/**
 * Update the status of an escrow
 * @param {org.acme.model.WithdrawMortgage} WithDrawMortgage - the WithdrawMortgage transaction
 * @transaction
 */
function mortgageWithdrawn(mortgageRequest) {
  if (mortgageRequest.escrow.status == 'BUYER_APPROVED') {
    var factory = getFactory();
    var namespace = 'org.acme.model';
    return getAssetRegistry(namespace + '.Escrow').then(function(escrowRegistry) {
      // update the order
      var escrow = mortgageRequest.escrow;
      escrow.buyerBankWithdrawn = true;
      escrow.status = 'MORTGAGE_WITHDRAWN';
      escrow.buyerBankDeposit -= mortgageRequest.amount;
      return escrowRegistry.update(escrow);
    }).then(function() {
        return getParticipantRegistry(namespace + '.SellerBank');
      })
      .then(function(sellerRegistry) {
        // update the order
        var participant = mortgageRequest.escrow.sellerBank;
        participant.balance += mortgageRequest.amount;
        return sellerRegistry.update(participant);
    })
    return;
  }
  else 
    throw new Error('Invalid Transaction'); 
  return;
}

/**
 * Update the status of an escrow
 * @param {org.acme.model.TransferTitle} TransferTitle - the title transfer transaction
 * @transaction
 */
function transferTitle(titleRequest) {
  if (titleRequest.escrow.status == 'MORTGAGE_WITHDRAWN') {
    var factory = getFactory();
    var namespace = 'org.acme.model';
    var total = 0;
    return getAssetRegistry(namespace + '.Title').then(function(titleRegistry) {
      // update the order
      var title = titleRequest.escrow.title;
      title.owner = titleRequest.escrow.buyer;
      return titleRegistry.update(title);
    }).then(function() {
        return getAssetRegistry(namespace + '.Escrow');
      })
      .then(function(escrowRegistry) {
        // update the order
        var escrow = titleRequest.escrow;
        escrow.status = 'DELIVERED';
        total += escrow.buyerDeposit;
        total += escrow.buyerBankDeposit;
        escrow.buyerDeposit = 0;
        escrow.buyerBankDeposit = 0;
        return escrowRegistry.update(escrow);
    }).then(function() {
        return getParticipantRegistry(namespace + '.Seller');
      })
      .then(function(sellerRegistry) {
        // update the order
        var participant = titleRequest.escrow.seller;
        participant.balance += total;
        return sellerRegistry.update(participant);
    })
  }
  else 
    throw new Error('Invalid Transaction'); 
  return;
}

/**
 * Update the status of an escrow
 * @param {org.acme.model.BuyerDeposit} BuyerDeposit - the buyer deposit transaction
 * @transaction
 */
function buyerDeposit(depositRequest) {
  if (depositRequest.escrow.status == 'STARTED') {
    var factory = getFactory();
    var namespace = 'org.acme.model';
    return getAssetRegistry(namespace + '.Escrow').then(function(escrowRegistry) {
      // update the order
      var escrow = depositRequest.escrow;
      escrow.status = 'BUYER_DEPOSITED';
      escrow.buyerDeposit = depositRequest.amount;
      return escrowRegistry.update(escrow);
    }).then(function() {
        return getParticipantRegistry(namespace + '.Buyer');
      })
      .then(function(buyerRegistry) {
        // update the order
        var participant = depositRequest.escrow.buyer;
        participant.balance -= depositRequest.amount;
        return buyerRegistry.update(participant);
    })		
  }
  else 
    throw new Error('Invalid Transaction');
  return;
}

/**
 * Update the status of an escrow
 * @param {org.acme.model.BuyerBankDeposit} BuyerBankDeposit - the buyer deposit transaction
 * @transaction
 */
function buyerBankDeposit(depositRequest) {
 if (depositRequest.escrow.status == 'BUYER_DEPOSITED') {
    var factory = getFactory();
    var namespace = 'org.acme.model';
    return getAssetRegistry(namespace + '.Escrow').then(function(escrowRegistry) {
      // update the order
      var escrow = depositRequest.escrow;
      escrow.status = 'BUYER_BANK_DEPOSITED';
      escrow.buyerBankDeposit = depositRequest.amount;
      return escrowRegistry.update(escrow);
    }).then(function() {
        return getParticipantRegistry(namespace + '.BuyerBank');
      })
      .then(function(buyerRegistry) {
        // update the order
        var participant = depositRequest.escrow.buyerBank;
        participant.balance -= depositRequest.amount;
        return buyerRegistry.update(participant);
    })
 }
  else 
    throw new Error('Invalid Transaction');
 return;
}

// DEMO SETUP FUNCTIONS
/**
 * Create the participants to use in the demo
* @param {org.acme.model.setupDemo} BuyerDeposit - the buyer deposit transaction
 * @transaction
 */
function setupDemo(demoRequest) { 
  var id = demoRequest.number
  var factory = getFactory();
  var namespace = 'org.acme.model';
  var buyer = factory.newResource(namespace, 'Buyer', id);
  buyer.name = 'Alice';
  buyer.balance = 100000.00
  var seller = factory.newResource(namespace, 'Seller', id);
  seller.name = 'Bob';
  seller.balance = 100000.00
  var sellerBank = factory.newResource(namespace, 'SellerBank', id);
  sellerBank.name = 'BAML';
  sellerBank.balance = 10000000.00
  var buyerBank = factory.newResource(namespace, 'BuyerBank', id);
  buyerBank.name = 'Citi';
  buyerBank.balance = 100000000.00
  var title = factory.newResource(namespace, 'Title', id);
  title.owner = seller
  var escrow = factory.newResource(namespace, 'Escrow', id);
  escrow.title = title;
  escrow.buyer = buyer;
  escrow.buyerBank = buyerBank;
  escrow.seller = seller;
  escrow.sellerBank = sellerBank;
  escrow.status = 'STARTED';
  escrow.buyerDeposit = 0;
  escrow.buyerBankDeposit = 0;
  escrow.buyerApproved = false;
  escrow.buyerBankWithdrawn = false;
  return getParticipantRegistry(namespace + '.Buyer')
    .then(function (buyerRegistry) {
    return buyerRegistry.add(buyer);
  })
  .then(function () {
    return getParticipantRegistry(namespace + '.Seller');
  })
    .then(function (sellerRegistry) {
    return sellerRegistry.add(seller);
  })
  .then(function () {
    return getParticipantRegistry(namespace + '.BuyerBank');
  })
    .then(function (buyerBankRegistry) {
    return buyerBankRegistry.add(buyerBank);
  })
  .then(function () {
    return getParticipantRegistry(namespace + '.SellerBank');
  })
    .then(function (sellerBankRegistry) {
    return sellerBankRegistry.add(sellerBank);
  })
  .then(function () {
    return getAssetRegistry(namespace + '.Title');
  })
    .then(function (titleRegistry) {
    return titleRegistry.add(title);
  })
  .then(function () {
    return getAssetRegistry(namespace + '.Escrow');
  })
    .then(function (escrowRegistry) {
    return escrowRegistry.add(escrow);
  })
}

