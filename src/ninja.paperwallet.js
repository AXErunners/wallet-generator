ninja.wallets.paperwallet = {
    isOpen: function () {
        return (document.getElementById("paperwallet").className.indexOf("selected") != -1);
    },

	open: function () {
		document.getElementById("main").setAttribute("class", "paper"); // add 'paper' class to main div
		var paperArea = document.getElementById("paperarea");
		paperArea.style.display = "block";
		var perPageLimitElement = document.getElementById("paperlimitperpage");
		var limitElement = document.getElementById("paperlimit");
		var pageBreakAt = (ninja.wallets.paperwallet.useArtisticWallet) ? ninja.wallets.paperwallet.pageBreakAtArtisticDefault : ninja.wallets.paperwallet.pageBreakAtDefault;
		if (perPageLimitElement && perPageLimitElement.value < 1) {
			perPageLimitElement.value = pageBreakAt;
		}
		if (limitElement && limitElement.value < 1) {
			limitElement.value = pageBreakAt;
		}
		if (document.getElementById("paperkeyarea").innerHTML == "") {
			document.getElementById("paperpassphrase").disabled = true;
			document.getElementById("paperencrypt").checked = false;
			ninja.wallets.paperwallet.encrypt = false;
			ninja.wallets.paperwallet.build(pageBreakAt, pageBreakAt, !document.getElementById('paperart').checked, document.getElementById('paperpassphrase').value);
		}
	},

	close: function () {
		document.getElementById("paperarea").style.display = "none";
		document.getElementById("main").setAttribute("class", ""); // remove 'paper' class from main div
	},

	remaining: null, // use to keep track of how many addresses are left to process when building the paper wallet
	count: 0,
	pageBreakAtDefault: 7,
	pageBreakAtArtisticDefault: 3,
	useArtisticWallet: true,
	pageBreakAt: null,

	build: function (numWallets, pageBreakAt, useArtisticWallet, passphrase) {
		if (numWallets < 1) numWallets = 1;
		if (pageBreakAt < 1) pageBreakAt = 1;
		ninja.wallets.paperwallet.remaining = numWallets;
		ninja.wallets.paperwallet.count = 0;
		ninja.wallets.paperwallet.useArtisticWallet = useArtisticWallet;
		ninja.wallets.paperwallet.pageBreakAt = pageBreakAt;
		document.getElementById("paperkeyarea").innerHTML = "";
		if (ninja.wallets.paperwallet.encrypt) {
			if (passphrase == "") {
				alert(ninja.translator.get("bip38alertpassphraserequired"));
				return;
			}
			document.getElementById("busyblock").className = "busy";
			ninja.privateKey.BIP38GenerateIntermediatePointAsync(passphrase, null, null, function (intermediate) {
				ninja.wallets.paperwallet.intermediatePoint = intermediate;
				document.getElementById("busyblock").className = "";
				setTimeout(ninja.wallets.paperwallet.batch, 0);
			});
		}
		else {
			setTimeout(ninja.wallets.paperwallet.batch, 0);
		}
	},

	batch: function () {
		if (ninja.wallets.paperwallet.remaining > 0) {
			var paperArea = document.getElementById("paperkeyarea");
			ninja.wallets.paperwallet.count++;
			var i = ninja.wallets.paperwallet.count;
			var pageBreakAt = ninja.wallets.paperwallet.pageBreakAt;
			var div = document.createElement("div");
			div.setAttribute("id", "keyarea" + i);
			if (ninja.wallets.paperwallet.useArtisticWallet) {
				div.innerHTML = ninja.wallets.paperwallet.templateArtisticHtml(i);
				div.setAttribute("class", "keyarea art");
			}
			else {
				div.innerHTML = ninja.wallets.paperwallet.templateHtml(i);
				div.setAttribute("class", "keyarea");
			}
			if (paperArea.innerHTML != "") {
				// page break
				if ((i - 1) % pageBreakAt == 0 && i >= pageBreakAt) {
					var pBreak = document.createElement("div");
					pBreak.setAttribute("class", "pagebreak");
					document.getElementById("paperkeyarea").appendChild(pBreak);
					div.style.pageBreakBefore = "always";
					if (!ninja.wallets.paperwallet.useArtisticWallet) {
						div.style.borderTop = "2px solid green";
					}
				}
			}
			document.getElementById("paperkeyarea").appendChild(div);
			ninja.wallets.paperwallet.generateNewWallet(i);
			ninja.wallets.paperwallet.remaining--;
			setTimeout(ninja.wallets.paperwallet.batch, 0);
		}
	},

	// generate bitcoin address, private key, QR Code and update information in the HTML
	// idPostFix: 1, 2, 3, etc.
	generateNewWallet: function (idPostFix) {
		if (ninja.wallets.paperwallet.encrypt) {
			var compressed = true;
			ninja.privateKey.BIP38GenerateECAddressAsync(ninja.wallets.paperwallet.intermediatePoint, compressed, function (address, encryptedKey) {
				Bitcoin.KeyPool.push(new Bitcoin.Bip38Key(address, encryptedKey));
				if (ninja.wallets.paperwallet.useArtisticWallet) {
					ninja.wallets.paperwallet.showArtisticWallet(idPostFix, address, encryptedKey);
				}
				else {
					ninja.wallets.paperwallet.showWallet(idPostFix, address, encryptedKey);
				}
			});
		}
		else {
			var key = new Bitcoin.ECKey(false);
			key.setCompressed(true);
			var bitcoinAddress = key.getBitcoinAddress();
			var privateKeyWif = key.getBitcoinWalletImportFormat();
			if (ninja.wallets.paperwallet.useArtisticWallet) {
				ninja.wallets.paperwallet.showArtisticWallet(idPostFix, bitcoinAddress, privateKeyWif);
			}
			else {
				ninja.wallets.paperwallet.showWallet(idPostFix, bitcoinAddress, privateKeyWif);
			}
		}
	},

	templateHtml: function (i) {
		var privateKeyLabel = ninja.translator.get("paperlabelprivatekey");
		if (ninja.wallets.paperwallet.encrypt) {
			privateKeyLabel = ninja.translator.get("paperlabelencryptedkey");
		}

		var walletHtml =
							"<div class='public'>" +
								"<div id='qrcode_public" + i + "' class='qrcode_public'></div>" +
								"<div class='pubaddress'>" +
									"<span class='label'>" + ninja.translator.get("paperlabelbitcoinaddress") + "</span>" +
									"<span class='output' id='btcaddress" + i + "'></span>" +
								"</div>" +
							"</div>" +
							"<div class='private'>" +
								"<div id='qrcode_private" + i + "' class='qrcode_private'></div>" +
								"<div class='privwif'>" +
									"<span class='label'>" + privateKeyLabel + "</span>" +
									"<span class='output' id='btcprivwif" + i + "'></span>" +
								"</div>" +
							"</div>";
		return walletHtml;
	},

	showWallet: function (idPostFix, bitcoinAddress, privateKey) {
		document.getElementById("btcaddress" + idPostFix).innerHTML = bitcoinAddress;
		document.getElementById("btcprivwif" + idPostFix).innerHTML = privateKey;
		var keyValuePair = {};
		keyValuePair["qrcode_public" + idPostFix] = bitcoinAddress;
		keyValuePair["qrcode_private" + idPostFix] = privateKey;
		ninja.qrCode.showQrCode(keyValuePair);
		document.getElementById("keyarea" + idPostFix).style.display = "block";
	},

	templateArtisticHtml: function (i) {
		var keyelement = 'btcprivwif';
		var image;
		if (ninja.wallets.paperwallet.encrypt) {
			keyelement = 'btcencryptedkey'
			image = '<%= assets["images/paper-wallet-empty"] %>';
		}
		else {
			image = '<%= assets["images/paper-wallet-empty"] %>';

		}

		var walletHtml =
							"<div class='artwallet' id='artwallet" + i + "'>" +
		//"<iframe src='bitcoin-wallet-01.svg' id='papersvg" + i + "' class='papersvg' ></iframe>" +
								"<img id='papersvg" + i + "' class='papersvg' src='" + image + "' />" +
								"<div id='qrcode_public" + i + "' class='qrcode_public'></div>" +
								"<div id='qrcode_private" + i + "' class='qrcode_private'></div>" +
								"<div class='btcaddress' id='btcaddress" + i + "'></div>" +
								"<div class='" + keyelement + "' id='" + keyelement + i + "'></div>" +
							"</div>";
		return walletHtml;
	},

	showArtisticWallet: function (idPostFix, bitcoinAddress, privateKey) {
		var keyValuePair = {};
		keyValuePair["qrcode_public" + idPostFix] = bitcoinAddress;
		keyValuePair["qrcode_private" + idPostFix] = privateKey;
		ninja.qrCode.showQrCode(keyValuePair, 2.5);
		document.getElementById("btcaddress" + idPostFix).innerHTML = bitcoinAddress;

		if (ninja.wallets.paperwallet.encrypt) {
			var half = privateKey.length / 2;
			document.getElementById("btcencryptedkey" + idPostFix).innerHTML = privateKey.slice(0, half) + '<br />' + privateKey.slice(half);
		}
		else {
			document.getElementById("btcprivwif" + idPostFix).innerHTML = privateKey;
		}

		// CODE to modify SVG DOM elements
		//var paperSvg = document.getElementById("papersvg" + idPostFix);
		//if (paperSvg) {
		//	svgDoc = paperSvg.contentDocument;
		//	if (svgDoc) {
		//		var bitcoinAddressElement = svgDoc.getElementById("bitcoinaddress");
		//		var privateKeyElement = svgDoc.getElementById("privatekey");
		//		if (bitcoinAddressElement && privateKeyElement) {
		//			bitcoinAddressElement.textContent = bitcoinAddress;
		//			privateKeyElement.textContent = privateKeyWif;
		//		}
		//	}
		//}
	},

	toggleArt: function (element) {
		ninja.wallets.paperwallet.resetLimits();
	},

	toggleEncrypt: function (element) {
		// enable/disable passphrase textbox
		document.getElementById("paperpassphrase").disabled = !element.checked;
		ninja.wallets.paperwallet.encrypt = element.checked;
		ninja.wallets.paperwallet.resetLimits();
	},

	resetLimits: function () {
		var hideArt = document.getElementById("paperart");
		var paperEncrypt = document.getElementById("paperencrypt");
		var limit;
		var limitperpage;

		document.getElementById("paperkeyarea").style.fontSize = "100%";
		if (!hideArt.checked) {
			limit = ninja.wallets.paperwallet.pageBreakAtArtisticDefault;
			limitperpage = ninja.wallets.paperwallet.pageBreakAtArtisticDefault;
		}
		else if (hideArt.checked && paperEncrypt.checked) {
			limit = ninja.wallets.paperwallet.pageBreakAtDefault;
			limitperpage = ninja.wallets.paperwallet.pageBreakAtDefault;
			// reduce font size
			document.getElementById("paperkeyarea").style.fontSize = "95%";
		}
		else if (hideArt.checked && !paperEncrypt.checked) {
			limit = ninja.wallets.paperwallet.pageBreakAtDefault;
			limitperpage = ninja.wallets.paperwallet.pageBreakAtDefault;
		}
		document.getElementById("paperlimitperpage").value = limitperpage;
		document.getElementById("paperlimit").value = limit;
	}
};