(function (ninja) {
	var ut = ninja.unitTests = {
		runSynchronousTests: function (showOutput) {
			if (showOutput) {
				document.getElementById("busyblock").className = "busy";
				var div = document.createElement("div");
				div.setAttribute("class", "unittests");
				div.setAttribute("id", "unittests");
			}
			var userKeyPool = Bitcoin.KeyPool.getArray(); // get the user key pool before test keys get added to it
			var testResults = "";
			var passCount = 0;
			var testCount = 0;
			for (var test in ut.synchronousTests) {
				var exceptionMsg = "";
				var resultBool = false;
				try {
					resultBool = ut.synchronousTests[test]();
				} catch (ex) {
					exceptionMsg = ex.toString();
					resultBool = false;
				}
				if (resultBool == true) {
					var passFailStr = "pass";
					passCount++;
				}
				else {
					var passFailStr = "<b>FAIL " + exceptionMsg + "</b>";
				}
				testCount++;
				testResults += test + ": " + passFailStr + "<br/>";
			}
			testResults += passCount + " of " + testCount + " synchronous tests passed";
			if (passCount < testCount) {
				testResults += "<br/><b>" + (testCount - passCount) + " unit test(s) failed</b>";
			}
			if (showOutput) {
				div.innerHTML = "<h3>Unit Tests</h3><div id=\"unittestresults\">" + testResults + "<br/><br/></div>";
				document.body.appendChild(div);
				document.getElementById("busyblock").className = "";
			}
			Bitcoin.KeyPool.setArray(userKeyPool); // set the key pool so users don't see the test keys
			return { passCount: passCount, testCount: testCount };
		},

		runAsynchronousTests: function (showOutput) {
			if (showOutput) {
				var div = document.createElement("div");
				div.setAttribute("class", "unittests");
				div.setAttribute("id", "asyncunittests");
				div.innerHTML = "<h3>Async Unit Tests</h3><div id=\"asyncunittestresults\"></div><br/><br/><br/><br/>";
				document.body.appendChild(div);
			}

			var userKeyPool = Bitcoin.KeyPool.getArray();
			// run the asynchronous tests one after another so we don't crash the browser
			ninja.foreachSerialized(ninja.unitTests.asynchronousTests, function (name, cb) {
				//Bitcoin.KeyPool.reset();
				document.getElementById("busyblock").className = "busy";
				ninja.unitTests.asynchronousTests[name](cb);
			}, function () {
				if (showOutput) {
					document.getElementById("asyncunittestresults").innerHTML += "running of asynchronous unit tests complete!<br/>";
				}
				console.log("running of asynchronous unit tests complete!");
				Bitcoin.KeyPool.setArray(userKeyPool);
				document.getElementById("busyblock").className = "";
			});
		},

		synchronousTests: {
			//ninja.publicKey tests
			testIsPublicKeyHexFormat: function () {
				var key = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var bool = ninja.publicKey.isPublicKeyHexFormat(key);
				if (bool != true) {
					return false;
				}
				return true;
			},
			testGetHexFromByteArray: function () {
				var bytes = [4, 78, 151, 49, 235, 238, 23, 118, 6, 129, 176, 32, 192, 98, 172, 198, 237, 135, 255, 34, 141, 124, 16, 143, 161, 173, 47, 16, 20, 26, 177, 34, 140, 50, 235, 178, 23, 230, 3, 49, 219, 213, 6, 210, 113, 15, 100, 71, 230, 114, 37, 34, 14, 58, 147, 97, 204, 232, 232, 255, 174, 116, 88, 152, 8];
				var key = ninja.publicKey.getHexFromByteArray(bytes);
				if (key != "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808") {
					return false;
				}
				return true;
			},
			testHexToBytes: function () {
				var key = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var bytes = Crypto.util.hexToBytes(key);
				if (bytes.toString() != "4,78,151,49,235,238,23,118,6,129,176,32,192,98,172,198,237,135,255,34,141,124,16,143,161,173,47,16,20,26,177,34,140,50,235,178,23,230,3,49,219,213,6,210,113,15,100,71,230,114,37,34,14,58,147,97,204,232,232,255,174,116,88,152,8") {
					return false;
				}
				return true;
			},
			testGetBitcoinAddressFromByteArray: function () {
				var bytes = [4, 78, 151, 49, 235, 238, 23, 118, 6, 129, 176, 32, 192, 98, 172, 198, 237, 135, 255, 34, 141, 124, 16, 143, 161, 173, 47, 16, 20, 26, 177, 34, 140, 50, 235, 178, 23, 230, 3, 49, 219, 213, 6, 210, 113, 15, 100, 71, 230, 114, 37, 34, 14, 58, 147, 97, 204, 232, 232, 255, 174, 116, 88, 152, 8];
				var address = ninja.publicKey.getBitcoinAddressFromByteArray(bytes);
				if (address != "XytM4ZSBXsWv23xk2tCXGgjYL3fuQ3oU3p") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromAdding: function () {
				var key1 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var key2 = "04EA23BD1A003DD8C032DD2A2AE5ABC4698FC66C7CBD33041D04AE0FAA02EBF1FEA0224F880465AABB30E085FA7DB4D6C963E3FE9DB9E3489E4AB4240921606375";
				var bytes = ninja.publicKey.getByteArrayFromAdding(key1, key2);
				if (bytes.toString() != "4,166,93,140,139,195,103,33,57,200,228,7,253,161,131,169,24,124,205,123,106,243,242,111,18,28,224,31,230,80,19,54,54,8,201,105,63,202,206,181,55,6,245,44,103,96,143,44,151,115,45,93,90,110,228,57,1,194,52,35,30,102,18,156,227") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromAddingCompressed: function () {
				var key1 = "024E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C";
				var key2 = "03EA23BD1A003DD8C032DD2A2AE5ABC4698FC66C7CBD33041D04AE0FAA02EBF1FE";
				var bytes = ninja.publicKey.getByteArrayFromAdding(key1, key2);
				var hex = ninja.publicKey.getHexFromByteArray(bytes);
				if (hex != "03A65D8C8BC3672139C8E407FDA183A9187CCD7B6AF3F26F121CE01FE650133636") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromAddingUncompressedAndCompressed: function () {
				var key1 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var key2 = "03EA23BD1A003DD8C032DD2A2AE5ABC4698FC66C7CBD33041D04AE0FAA02EBF1FE";
				var bytes = ninja.publicKey.getByteArrayFromAdding(key1, key2);
				if (bytes.toString() != "4,166,93,140,139,195,103,33,57,200,228,7,253,161,131,169,24,124,205,123,106,243,242,111,18,28,224,31,230,80,19,54,54,8,201,105,63,202,206,181,55,6,245,44,103,96,143,44,151,115,45,93,90,110,228,57,1,194,52,35,30,102,18,156,227") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromAddingShouldReturnNullWhenSameKey1: function () {
				var key1 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var key2 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var bytes = ninja.publicKey.getByteArrayFromAdding(key1, key2);
				if (bytes != null) {
					return false;
				}
				return true;
			},
			testGetByteArrayFromAddingShouldReturnNullWhenSameKey2: function () {
				var key1 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var key2 = "024E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C";
				var bytes = ninja.publicKey.getByteArrayFromAdding(key1, key2);
				if (bytes != null) {
					return false;
				}
				return true;
			},
			testGetByteArrayFromMultiplying: function () {
				var key1 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var key2 = "SQE6yipP5oW8RBaStWoB47xsRQ8pat";
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(key1, new Bitcoin.ECKey(key2));
				if (bytes.toString() != "4,41,207,229,207,216,239,87,206,61,90,245,53,46,196,220,179,163,148,221,122,193,22,5,6,54,96,25,200,16,186,224,246,121,219,101,213,215,29,86,228,103,200,49,73,81,202,116,111,57,77,58,208,19,31,182,6,86,124,229,181,176,14,96,19") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromMultiplyingCompressedOutputsUncompressed: function () {
				var key1 = "024E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C";
				var key2 = "SQE6yipP5oW8RBaStWoB47xsRQ8pat";
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(key1, new Bitcoin.ECKey(key2));
				if (bytes.toString() != "4,41,207,229,207,216,239,87,206,61,90,245,53,46,196,220,179,163,148,221,122,193,22,5,6,54,96,25,200,16,186,224,246,121,219,101,213,215,29,86,228,103,200,49,73,81,202,116,111,57,77,58,208,19,31,182,6,86,124,229,181,176,14,96,19") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromMultiplyingCompressedOutputsCompressed: function () {
				var key1 = "024E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C";
				var key2 = "XFqz4wkvUUemzxUz2qzsP87ovetYFzYGTx6ksMzQtFkEZPfTFoyw";
				var ecKey = new Bitcoin.ECKey(key2);
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(key1, ecKey);
				if (bytes.toString() != "3,41,207,229,207,216,239,87,206,61,90,245,53,46,196,220,179,163,148,221,122,193,22,5,6,54,96,25,200,16,186,224,246") {
					return false;
				}
				return true;
			},
			testGetByteArrayFromMultiplyingShouldReturnNullWhenSameKey1: function () {
				var key1 = "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808";
				var key2 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(key1, new Bitcoin.ECKey(key2));
				if (bytes != null) {
					return false;
				}
				return true;
			},
			testGetByteArrayFromMultiplyingShouldReturnNullWhenSameKey2: function () {
				var key1 = "024E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C";
				var key2 = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(key1, new Bitcoin.ECKey(key2));
				if (bytes != null) {
					return false;
				}
				return true;
			},
			// confirms multiplication is working and BigInteger was created correctly (Pub Key B vs Priv Key A)
			testGetPubHexFromMultiplyingPrivAPubB: function () {
				var keyPub = "04F04BF260DCCC46061B5868F60FE962C77B5379698658C98A93C3129F5F98938020F36EBBDE6F1BEAF98E5BD0E425747E68B0F2FB7A2A59EDE93F43C0D78156FF";
				var keyPriv = "B1202A137E917536B3B4C5010C3FF5DDD4784917B3EEF21D3A3BF21B2E03310C";
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(keyPub, new Bitcoin.ECKey(keyPriv));
				var pubHex = ninja.publicKey.getHexFromByteArray(bytes);
				if (pubHex != "04C6732006AF4AE571C7758DF7A7FB9E3689DFCF8B53D8724D3A15517D8AB1B4DBBE0CB8BB1C4525F8A3001771FC7E801D3C5986A555E2E9441F1AD6D181356076") {
					return false;
				}
				return true;
			},
			// confirms multiplication is working and BigInteger was created correctly (Pub Key A vs Priv Key B)
			testGetPubHexFromMultiplyingPrivBPubA: function () {
				var keyPub = "0429BF26C0AF7D31D608474CEBD49DA6E7C541B8FAD95404B897643476CE621CFD05E24F7AE8DE8033AADE5857DB837E0B704A31FDDFE574F6ECA879643A0D3709";
				var keyPriv = "7DE52819F1553C2BFEDE6A2628B6FDDF03C2A07EB21CF77ACA6C2C3D252E1FD9";
				var bytes = ninja.publicKey.getByteArrayFromMultiplying(keyPub, new Bitcoin.ECKey(keyPriv));
				var pubHex = ninja.publicKey.getHexFromByteArray(bytes);
				if (pubHex != "04C6732006AF4AE571C7758DF7A7FB9E3689DFCF8B53D8724D3A15517D8AB1B4DBBE0CB8BB1C4525F8A3001771FC7E801D3C5986A555E2E9441F1AD6D181356076") {
					return false;
				}
				return true;
			},

			// Private Key tests
			testBadKeyIsNotWif: function () {
				return !(Bitcoin.ECKey.isWalletImportFormat("bad key"));
			},
			testBadKeyIsNotWifCompressed: function () {
				return !(Bitcoin.ECKey.isCompressedWalletImportFormat("bad key"));
			},
			testBadKeyIsNotHex: function () {
				return !(Bitcoin.ECKey.isHexFormat("bad key"));
			},
			testBadKeyIsNotBase64: function () {
				return !(Bitcoin.ECKey.isBase64Format("bad key"));
			},
			testBadKeyIsNotMini: function () {
				return !(Bitcoin.ECKey.isMiniFormat("bad key"));
			},
			testBadKeyReturnsNullPrivFromECKey: function () {
				var key = "bad key";
				var ecKey = new Bitcoin.ECKey(key);
				if (ecKey.priv != null) {
					return false;
				}
				return true;
			},
			testGetBitcoinPrivateKeyByteArray: function () {
				var key = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var bytes = [214, 232, 106, 13, 71, 201, 234, 251, 189, 43, 217, 152, 40, 133, 132, 45, 159, 81, 50, 56, 246, 45, 201, 10, 181, 224, 52, 247, 97, 165, 79, 169];
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinPrivateKeyByteArray().toString() != bytes.toString()) {
					return false;
				}
				return true;
			},
			testECKeyDecodeWalletImportFormat: function () {
				var key = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var bytes1 = [214, 232, 106, 13, 71, 201, 234, 251, 189, 43, 217, 152, 40, 133, 132, 45, 159, 81, 50, 56, 246, 45, 201, 10, 181, 224, 52, 247, 97, 165, 79, 169];
				var bytes2 = Bitcoin.ECKey.decodeWalletImportFormat(key);
				if (bytes1.toString() != bytes2.toString()) {
					return false;
				}
				return true;
			},
			testECKeyDecodeCompressedWalletImportFormat: function () {
				var key = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var bytes1 = [214, 232, 106, 13, 71, 201, 234, 251, 189, 43, 217, 152, 40, 133, 132, 45, 159, 81, 50, 56, 246, 45, 201, 10, 181, 224, 52, 247, 97, 165, 79, 169];
				var bytes2 = Bitcoin.ECKey.decodeCompressedWalletImportFormat(key);
				if (bytes1.toString() != bytes2.toString()) {
					return false;
				}
				return true;
			},
			testWifToPubKeyHex: function () {
				var key = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getPubKeyHex() != "044E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C32EBB217E60331DBD506D2710F6447E67225220E3A9361CCE8E8FFAE74589808"
						|| btcKey.getPubPoint().compressed != false) {
					return false;
				}
				return true;
			},
			testWifToPubKeyHexCompressed: function () {
				var key = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var btcKey = new Bitcoin.ECKey(key);
				btcKey.setCompressed(true);
				if (btcKey.getPubKeyHex() != "024E9731EBEE17760681B020C062ACC6ED87FF228D7C108FA1AD2F10141AB1228C"
						|| btcKey.getPubPoint().compressed != true) {
					return false;
				}
				return true;
			},
			testBase64ToECKey: function () {
				var key = "1uhqDUfJ6vu9K9mYKIWELZ9RMjj2LckKteA092GlT6k=";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinBase64Format() != "1uhqDUfJ6vu9K9mYKIWELZ9RMjj2LckKteA092GlT6k=") {
					return false;
				}
				return true;
			},
			testHexToECKey: function () {
				var key = "D6E86A0D47C9EAFBBD2BD9982885842D9F513238F62DC90AB5E034F761A54FA9";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinHexFormat() != "D6E86A0D47C9EAFBBD2BD9982885842D9F513238F62DC90AB5E034F761A54FA9") {
					return false;
				}
				return true;
			},
			testCompressedWifToECKey: function () {
				var key = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinWalletImportFormat() != "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8"
						|| btcKey.getPubPoint().compressed != true
						|| btcKey.compressed != true) {
					return false;
				}
				return true;
			},
			testWifToECKey: function () {
				var key = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinWalletImportFormat() != "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5"
					|| btcKey.compressed == true) {
					return false;
				}
				return true;
			},
			testBrainToECKey: function () {
				var key = "paper.das.org unit test";
				var bytes = Crypto.SHA256(key, { asBytes: true });
				var btcKey = new Bitcoin.ECKey(bytes);
				if (btcKey.getBitcoinWalletImportFormat() != "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5") {
					return false;
				}
				return true;
			},
			testMini30CharsToECKey: function () {
				var key = "SQE6yipP5oW8RBaStWoB47xsRQ8pat";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinWalletImportFormat() != "7rakk2z5Qu2mBQu78DThsKqDSkUY6fQrGd3fVBCCJWAo7z3j5Nd") {
					return false;
				}
				return true;
			},
			testGetECKeyFromAdding: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "SQE6yipP5oW8RBaStWoB47xsRQ8pat";
				var ecKey = ninja.privateKey.getECKeyFromAdding(key1, key2);
				if (ecKey.getBitcoinWalletImportFormat() != "7rGf6ijqoHGg9jWUcAzD1CPamNBwWFYsEWxWaHwY1696uNsKmAp") {
					return false;
				}
				return true;
			},
			testGetECKeyFromAddingCompressed: function () {
				var key1 = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var key2 = "XFqz4wkvUUemzxUz2qzsP87ovetYFzYGTx6ksMzQtFkEZPfTFoyw";
				var ecKey = ninja.privateKey.getECKeyFromAdding(key1, key2);
				if (ecKey.getBitcoinWalletImportFormat() != "XEU7AFE6PGpBoYd6rF5VysGg2pXHa7DeifE1XwmhqPgm3pGCwSmM") {
					return false;
				}
				return true;
			},
			testGetECKeyFromAddingUncompressedAndCompressed: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "XFqz4wkvUUemzxUz2qzsP87ovetYFzYGTx6ksMzQtFkEZPfTFoyw";
				var ecKey = ninja.privateKey.getECKeyFromAdding(key1, key2);
				if (ecKey.getBitcoinWalletImportFormat() != "7rGf6ijqoHGg9jWUcAzD1CPamNBwWFYsEWxWaHwY1696uNsKmAp") {
					return false;
				}
				return true;
			},
			testGetECKeyFromAddingShouldReturnNullWhenSameKey1: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var ecKey = ninja.privateKey.getECKeyFromAdding(key1, key2);
				if (ecKey != null) {
					return false;
				}
				return true;
			},
			testGetECKeyFromAddingShouldReturnNullWhenSameKey2: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var ecKey = ninja.privateKey.getECKeyFromAdding(key1, key2);
				if (ecKey != null) {
					return false;
				}
				return true;
			},
			testGetECKeyFromMultiplying: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "SQE6yipP5oW8RBaStWoB47xsRQ8pat";
				var ecKey = ninja.privateKey.getECKeyFromMultiplying(key1, key2);
				if (ecKey.getBitcoinWalletImportFormat() != "7qyM3FwY1SsJf6txML6dcAmEH6tm3P9LzZgGarraQBmDDUgkm89") {
					return false;
				}
				return true;
			},
			testGetECKeyFromMultiplyingCompressed: function () {
				var key1 = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var key2 = "XFqz4wkvUUemzxUz2qzsP87ovetYFzYGTx6ksMzQtFkEZPfTFoyw";
				var ecKey = ninja.privateKey.getECKeyFromMultiplying(key1, key2);
				if (ecKey.getBitcoinWalletImportFormat() != "XD9hSxwhryB2wB2KJjHraE6Dc51TPWjqF5EKnT3pRLW8uaSXEA94") {
					return false;
				}
				return true;
			},
			testGetECKeyFromMultiplyingUncompressedAndCompressed: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "XFqz4wkvUUemzxUz2qzsP87ovetYFzYGTx6ksMzQtFkEZPfTFoyw";
				var ecKey = ninja.privateKey.getECKeyFromMultiplying(key1, key2);
				if (ecKey.getBitcoinWalletImportFormat() != "7qyM3FwY1SsJf6txML6dcAmEH6tm3P9LzZgGarraQBmDDUgkm89") {
					return false;
				}
				return true;
			},
			testGetECKeyFromMultiplyingShouldReturnNullWhenSameKey1: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var ecKey = ninja.privateKey.getECKeyFromMultiplying(key1, key2);
				if (ecKey != null) {
					return false;
				}
				return true;
			},
			testGetECKeyFromMultiplyingShouldReturnNullWhenSameKey2: function () {
				var key1 = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var key2 = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var ecKey = ninja.privateKey.getECKeyFromMultiplying(key1, key2);
				if (ecKey != null) {
					return false;
				}
				return true;
			},
			testGetECKeyFromBase6Key: function () {
				var baseKey = "100531114202410255230521444145414341221420541210522412225005202300434134213212540304311321323051431";
				var hexKey = "292665C3872418ADF1DA7FFA3A646F2F0602246DA6098A91D229C32150F2718B";
				var ecKey = new Bitcoin.ECKey(baseKey);
				if (ecKey.getBitcoinHexFormat() != hexKey) {
					return false;
				}
				return true;
			},

			// EllipticCurve tests
			testDecodePointEqualsDecodeFrom: function () {
				var key = "04F04BF260DCCC46061B5868F60FE962C77B5379698658C98A93C3129F5F98938020F36EBBDE6F1BEAF98E5BD0E425747E68B0F2FB7A2A59EDE93F43C0D78156FF";
				var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
				var ecPoint1 = EllipticCurve.PointFp.decodeFrom(ecparams.getCurve(), Crypto.util.hexToBytes(key));
				var ecPoint2 = ecparams.getCurve().decodePointHex(key);
				if (!ecPoint1.equals(ecPoint2)) {
					return false;
				}
				return true;
			},
			testDecodePointHexForCompressedPublicKey: function () {
				var key = "03F04BF260DCCC46061B5868F60FE962C77B5379698658C98A93C3129F5F989380";
				var pubHexUncompressed = ninja.publicKey.getDecompressedPubKeyHex(key);
				if (pubHexUncompressed != "04F04BF260DCCC46061B5868F60FE962C77B5379698658C98A93C3129F5F98938020F36EBBDE6F1BEAF98E5BD0E425747E68B0F2FB7A2A59EDE93F43C0D78156FF") {
					return false;
				}
				return true;
			},
			// old bugs
			testBugWithLeadingZeroBytePublicKey: function () {
				var key = "5Je7CkWTzgdo1RpwjYhwnVKxQXt8EPRq17WZFtWcq5umQdsDtTP";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinAddress() != "1M6dsMZUjFxjdwsyVk8nJytWcfr9tfUa9E") {
					return false;
				}
				return true;
			},
			testBugWithLeadingZeroBytePrivateKey: function () {
				var key = "0004d30da67214fa65a41a6493576944c7ea86713b14db437446c7a8df8e13da";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getBitcoinAddress() != "1NAjZjF81YGfiJ3rTKc7jf1nmZ26KN7Gkn") {
					return false;
				}
				return true;
			},

			// test split wallet
			testSplitAndCombinePrivateKey2of2: function () {
				// lowercase hex key
				var key = "0004d30da67214fa65a41a6493576944c7ea86713b14db437446c7a8df8e13da"; //5HpJ4bpHFEMWYwCidjtZHwM2rsMh4PRfmZKV8Y21i7msiUkQKUW
				var numshares = 2;
				var threshold = 2;
				secrets.setRNG();
				secrets.init(7);

				var shares = ninja.wallets.splitwallet.getFormattedShares(key, numshares, threshold);
				var combined = ninja.wallets.splitwallet.combineFormattedShares(shares);
				var btcKey = new Bitcoin.ECKey(combined);

				if (btcKey.getBitcoinHexFormat() != key.toUpperCase()) {
					return false;
				}
				return true;
			},
			// Example use case #1:
			// Division of 3 shares:
			//   1 share in a safety deposit box ("Box")
			//   1 share at Home
			//   1 share at Work
			// Threshold of 2 can be redeemed in these permutations 
			//   Home + Box 
			//   Work + Box 
			//   Home + Work 
			testSplitAndCombinePrivateKey2of3: function () {
				// lowercase hex key
				var key = "0004d30da67214fa65a41a6493576944c7ea86713b14db437446c7a8df8e13da"; //5HpJ4bpHFEMWYwCidjtZHwM2rsMh4PRfmZKV8Y21i7msiUkQKUW
				var numshares = 3;
				var threshold = 2;
				secrets.setRNG();
				secrets.init(7);

				var shares = ninja.wallets.splitwallet.getFormattedShares(key, numshares, threshold);
				shares.shift();
				var combined = ninja.wallets.splitwallet.combineFormattedShares(shares);
				var btcKey = new Bitcoin.ECKey(combined);

				if (btcKey.getBitcoinHexFormat() != key.toUpperCase()) {
					return false;
				}
				return true;
			},
			testSplitAndCombinePrivateKey2of4: function () {
				// uppercase hex key
				var key = "292665C3872418ADF1DA7FFA3A646F2F0602246DA6098A91D229C32150F2718B"; //7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5
				var numshares = 4;
				var threshold = 2;
				secrets.setRNG();
				secrets.init(7);

				var shares = ninja.wallets.splitwallet.getFormattedShares(key, numshares, threshold);
				shares.shift();
				shares.shift();
				var combined = ninja.wallets.splitwallet.combineFormattedShares(shares);
				var btcKey = new Bitcoin.ECKey(combined);

				if (btcKey.getBitcoinHexFormat() != key) {
					return false;
				}
				return true;
			},
			// Example use case #2:
			// Division of 13 shares:
			//   4 shares in a safety deposit box ("Box")
			//   3 shares with good friend Angie
			//   3 shares with good friend Fred
			//   3 shares with Self at home or office
			// Threshold of 7 can be redeemed in these permutations 
			//   Self + Box (no trust to spend your coins but your friends are backing up your shares)
			//   Angie + Box (Angie will send btc to executor of your will)
			//   Fred + Box (if Angie hasn't already then Fred will send btc to executor of your will)
			//   Angie + Fred + Self (bank fire/theft then you with both your friends can spend the coins)
			testSplitAndCombinePrivateKey7of13: function () {
				var key = "0004d30da67214fa65a41a6493576944c7ea86713b14db437446c7a8df8e13da";
				var numshares = 12;
				var threshold = 7;
				secrets.setRNG();
				secrets.init(7);

				var shares = ninja.wallets.splitwallet.getFormattedShares(key, numshares, threshold);
				var combined = ninja.wallets.splitwallet.combineFormattedShares(shares);
				var btcKey = new Bitcoin.ECKey(combined);

				if (btcKey.getBitcoinHexFormat() != key.toUpperCase()) {
					return false;
				}
				return true;
			},
			testCombinePrivateKeyFromXofYShares: function () {
				var key = "7rtMgwx2hwRAnAjhqYFkXY94PaQWMvFjiKhko97F1VgETt21z5r";
				// these are 4 of 6 shares
				var shares = ["3XxjMASmrkk6eXMM9kAJA7qiqViNVBfiwA1GQDLvg4PVScL", "3Y2DkcPuNX8VKZwpnDdxw55wJtcnCvv2nALqe8nBLViHvck", 
					"3Y6qv7kyGwgRBKVHVbUNtzmLYAZWQtTPztPwR8wc7uf4MXR", "3YD4TowZn6jw5ss8U89vrcPHonFW4vSs9VKq8MupV5kevG4"]
				secrets.setRNG();
				secrets.init(7);

				var combined = ninja.wallets.splitwallet.combineFormattedShares(shares);
				var btcKey = new Bitcoin.ECKey(combined);
				if (btcKey.getBitcoinWalletImportFormat() != key) {
					return false;
				}
				return true;
			},

			//Bitcoin.KeyPool tests
			testKeyPoolStoresCompressedAndUncompressedKey: function () {
				var keyUncompressed = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var keyCompressed = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				Bitcoin.KeyPool.reset();

				var btcKeyUncompressed = new Bitcoin.ECKey(keyUncompressed);
				var btcKeyCompressed = new Bitcoin.ECKey(keyCompressed);
				var pool = Bitcoin.KeyPool.getArray();
				
				if (pool.length != 2
					|| pool[0].getBitcoinWalletImportFormat() != keyUncompressed
					|| pool[1].getBitcoinWalletImportFormat() != keyCompressed
				) {
					return false;
				}
				return true;
			},
			testKeyPoolPreventDuplicatesWhenAdding: function () {
				var keyUncompressed = "7sBWXDmK5btLcVjxKnmLfcU3X8bi8vdjpDAvqy3nndKSBXJa7Q5";
				var keyCompressed = "XJVPJPLaoJybZfrbBvzhoRYN7zYCZyj9yNipf8PK6PJN9R3k9mL8";
				var keyHex = "292665C3872418ADF1DA7FFA3A646F2F0602246DA6098A91D229C32150F2718B";

				Bitcoin.KeyPool.reset();
				var btcKeyUncompressed = new Bitcoin.ECKey(keyUncompressed);
				var btcKeyCompressed = new Bitcoin.ECKey(keyCompressed);
				var btcKeyCompressed2 = new Bitcoin.ECKey(keyCompressed);
				var btcKeyUncompressed2 = new Bitcoin.ECKey(keyUncompressed);
				var btcKeyHex = new Bitcoin.ECKey(keyHex);
				var pool = Bitcoin.KeyPool.getArray();
				
				if (pool.length != 2
					|| pool[0].getBitcoinWalletImportFormat() != keyUncompressed
					|| pool[1].getBitcoinWalletImportFormat() != keyCompressed
				) {
					return false;
				}
				return true;
			},

			//BigInteger tests
			testBigIntegerShouldWorkWithoutNew: function () {
				var bi = BigInteger('12345')
				if (bi.toString(10) != '12345') {
					return false;
				}
				return true;
			},
			testBigIntegerShouldWorkWithStringInput: function () {
				if (new BigInteger('12345').toString(16) != '3039') return false;
				if (new BigInteger('29048849665247').toString(16) != '1a6b765d8cdf') return false;
				if (new BigInteger('-29048849665247').toString(16) != '-1a6b765d8cdf') return false;
				if (new BigInteger('1A6B765D8CDF', 16).toString(16) != '1a6b765d8cdf') return false;
				if (new BigInteger('FF', 16).toString() != '255') return false;
				if (new BigInteger('1A6B765D8CDF', 16).toString() != '29048849665247') return false;
				if (new BigInteger('a89c e5af8724 c0a23e0e 0ff77500', 16).toString(16) != 'a89ce5af8724c0a23e0e0ff77500') return false;
				if (new BigInteger('123456789abcdef123456789abcdef123456789abcdef', 16).toString(16) != '123456789abcdef123456789abcdef123456789abcdef') return false;
				if (new BigInteger('10654321').toString() != '10654321') return false;
				if (new BigInteger('10000000000000000').toString(10) != '10000000000000000') return false;

				return true;
			},
			testBigIntegerShouldImportExportTwosComplementBigEndian: function () {
				if (new BigInteger([1, 2, 3], 256).toString(16) != '10203') return false;
				if (new BigInteger([1, 2, 3, 4], 256).toString(16) != '1020304') return false;
				if (new BigInteger([1, 2, 3, 4, 5], 256).toString(16) != '102030405') return false;
				if (new BigInteger([1, 2, 3, 4, 5, 6, 7, 8], 256).toString(16) != '102030405060708') return false;
				if (new BigInteger([1, 2, 3, 4], 256).toByteArray().join(',') != '1,2,3,4') return false;
				if (new BigInteger([1, 2, 3, 4, 5, 6, 7, 8], 256).toByteArray().join(',') != '1,2,3,4,5,6,7,8') return false;

				return true;
			},
			testBigIntegerShouldReturnProperBitLength: function () {
				if (new BigInteger('0').bitLength() != 0) return false;
				if (new BigInteger('1', 16).bitLength() != 1) return false;
				if (new BigInteger('2', 16).bitLength() != 2) return false;
				if (new BigInteger('3', 16).bitLength() != 2) return false;
				if (new BigInteger('4', 16).bitLength() != 3) return false;
				if (new BigInteger('8', 16).bitLength() != 4) return false;
				if (new BigInteger('10', 16).bitLength() != 5) return false;
				if (new BigInteger('100', 16).bitLength() != 9) return false;
				if (new BigInteger('123456', 16).bitLength() != 21) return false;
				if (new BigInteger('123456789', 16).bitLength() != 33) return false;
				if (new BigInteger('8023456789', 16).bitLength() != 40) return false;

				return true;
			},
			testBigIntegerShouldAddNumbers: function () {
				// test 1
				if (new BigInteger('14').add(new BigInteger('26')).toString(16) != '28') return false;

				// test 2
				var k = new BigInteger('1234', 16);
				var r = k;
				for (var i = 0; i < 257; i++) r = r.add(k);
				if (r.toString(16) != '125868') return false;

				// test 3
				var k = new BigInteger('abcdefabcdefabcdef', 16);
				var r = new BigInteger('deadbeef', 16);
				for (var i = 0; i < 257; i++) {
					r = r.add(k);
				}
				if (r.toString(16) != 'ac79bd9b79be7a277bde') return false;

				return true;
			},
			testBigIntegerShouldSubtractNumbers: function () {
				// test 1
				if (new BigInteger('14').subtract(new BigInteger('26')).toString(16) != '-c') return false;
				// test 2
				if (new BigInteger('26').subtract(new BigInteger('14')).toString(16) != 'c') return false;
				// test 3
				if (new BigInteger('26').subtract(new BigInteger('26')).toString(16) != '0') return false;
				// test 4
				if (new BigInteger('-26').subtract(new BigInteger('26')).toString(16) != '-34') return false;
				// test 5
				var a = new BigInteger('31ff3c61db2db84b9823d320907a573f6ad37c437abe458b1802cda041d6384a7d8daef41395491e2', 16);
				var b = new BigInteger('6f0e4d9f1d6071c183677f601af9305721c91d31b0bbbae8fb790000', 16);
				var r = new BigInteger('31ff3c61db2db84b9823d3208989726578fd75276287cd9516533a9acfb9a6776281f34583ddb91e2', 16);
				if (a.subtract(b).compareTo(r) != 0) return false;
				// test 6
				var r = b.subtract(new BigInteger('14'));
				if (b.clone().subtract(new BigInteger('14')).compareTo(r) != 0) return false;
				// test 7
				var r = new BigInteger('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b', 16);
				if (r.subtract(new BigInteger('-1')).toString(16) != '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681c') return false;
				// test 8
				// Carry and copy
				var a = new BigInteger('12345', 16);
				var b = new BigInteger('1000000000000', 16);
				if (a.subtract(b).toString(16) != '-fffffffedcbb') return false;
				// test 9
				var a = new BigInteger('12345', 16);
				var b = new BigInteger('1000000000000', 16);
				if (b.subtract(a).toString(16) != 'fffffffedcbb') return false;
				
				return true;
			},
			testBigIntegerShouldMultiplyNumbers: function () {
				if (new BigInteger('1001', 16).multiply(new BigInteger('1234', 16)).toString(16) != '1235234') return false;
				if (new BigInteger('-1001', 16).multiply(new BigInteger('1234', 16)).toString(16) != '-1235234') return false;
				if (new BigInteger('-1001', 16).multiply(new BigInteger('-1234', 16)).toString(16) != '1235234') return false;

				// test 4
				var n = new BigInteger('1001', 16);
				var r = n;
				for (var i = 0; i < 4; i++) {
					r = r.multiply(n);
				}
				if (r.toString(16) != '100500a00a005001') return false;

				var n = new BigInteger('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16);
				if (n.multiply(n).toString(16) != '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40') return false;
				if (n.multiply(n).multiply(n).toString(16) != '1b888e01a06e974017a28a5b4da436169761c9730b7aeedf75fc60f687b46e0cf2cb11667f795d5569482640fe5f628939467a01a612b023500d0161e9730279a7561043af6197798e41b7432458463e64fa81158907322dc330562697d0d600') return false;

				if (new BigInteger('-100000000000').multiply(new BigInteger('3').divide(new BigInteger('4'))).toString(16) != '0') return false;

				return true;
			},
			testBigIntegerShouldDivideNumbers: function () {
				if (new BigInteger('10').divide(new BigInteger('256')).toString(16) != '0') return false;
				if (new BigInteger('69527932928').divide(new BigInteger('16974594')).toString(16) != 'fff') return false;
				if (new BigInteger('-69527932928').divide(new BigInteger('16974594')).toString(16) != '-fff') return false;

				var b = new BigInteger('39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40', 16);
				var n = new BigInteger('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16);
				if (b.divide(n).toString(16) != n.toString(16)) return false;

				if (new BigInteger('1').divide(new BigInteger('-5')).toString(10) != '0') return false;

				//	// Regression after moving to word div
				var p = new BigInteger('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16);
				var a = new BigInteger('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16);
				var as = a.square();
				if (as.divide(p).toString(16) != '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729e58090b9') return false;

				var p = new BigInteger('ffffffff00000001000000000000000000000000ffffffffffffffffffffffff', 16);
				var a = new BigInteger('fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
				if (a.divide(p).toString(16) != 'ffffffff00000002000000000000000000000001000000000000000000000001') return false;
				
				return true;
			},
			testBigIntegerShouldModNumbers: function () {
				if (new BigInteger('10').mod(new BigInteger('256')).toString(16) != 'a') return false;
				if (new BigInteger('69527932928').mod(new BigInteger('16974594')).toString(16) != '102f302') return false;
				if (new BigInteger('-69527932928').mod(new BigInteger('16974594')).toString(16) != '1000') return false;
				if (new BigInteger('10', 16).mod(new BigInteger('256')).toString(16) != '10') return false;
				if (new BigInteger('100', 16).mod(new BigInteger('256')).toString(16) != '0') return false;
				if (new BigInteger('1001', 16).mod(new BigInteger('256')).toString(16) != '1') return false;
				if (new BigInteger('100000000001', 16).mod(new BigInteger('256')).toString(16) != '1') return false;
				if (new BigInteger('100000000001', 16).mod(new BigInteger('257')).toString(16) != new BigInteger('100000000001', 16).mod(new BigInteger('257')).toString(16)) return false;
				if (new BigInteger('123456789012', 16).mod(new BigInteger('3')).toString(16) != new BigInteger('123456789012', 16).mod(new BigInteger('3')).toString(16)) return false;

				var p = new BigInteger('ffffffff00000001000000000000000000000000ffffffffffffffffffffffff', 16);
				var a = new BigInteger('fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
				if (a.mod(p).toString(16) != '0') return false;
				
				return true;
			},
			testBigIntegerShouldShiftLeftNumbers: function () {
				if (new BigInteger('69527932928').shiftLeft(13).toString(16) != '2060602000000') return false;
				if (new BigInteger('69527932928').shiftLeft(45).toString(16) != '206060200000000000000') return false;
				
				return true;
			},
			testBigIntegerShouldShiftRightNumbers: function () {
				if (new BigInteger('69527932928').shiftRight(13).toString(16) != '818180') return false;
				if (new BigInteger('69527932928').shiftRight(17).toString(16) != '81818') return false;
				if (new BigInteger('69527932928').shiftRight(256).toString(16) != '0') return false;
				
				return true;
			},
			testBigIntegerShouldModInverseNumbers: function () {
				var p = new BigInteger('257');
				var a = new BigInteger('3');
				var b = a.modInverse(p);
				if (a.multiply(b).mod(p).toString(16) != '1') return false;

				var p192 = new BigInteger('fffffffffffffffffffffffffffffffeffffffffffffffff', 16);
				var a = new BigInteger('deadbeef', 16);
				var b = a.modInverse(p192);
				if (a.multiply(b).mod(p192).toString(16) != '1') return false;
				
				return true;
			},
			testBigIntegerShouldThrowOnModInverseOfZero: function () {
				var p = new BigInteger('257');
				var a = new BigInteger('0');
				//division by zero
				try {
					a.modInverse(p);
				}
				catch (e) {
					return true;
				}
				return false;
			},
			testBigIntegerShouldAlwaysReturnPositiveNumber: function () {
				var z = new BigInteger('cc61934972bba029382f0bef146b228ca15d54f7e38b6cd5f6b382398b7a97a8', 16);
				var p = new BigInteger('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16);
				var zInv = z.modInverse(p);
				if (zInv.signum() !== 1) return false; //zInv should be positive
				
				return true;
			},
			testECKeyDoesntHangWithSpecificKey: function () {
				var key = "848b39bbe4c9ddf978d3d8f786315bdc3ba71237d5f780399e0026e1269313ef";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.getPubKeyHex() != "0478BC8F7CB4485E7A0314A698AA1600639FF2922D09C26DED5F730CAC4784477D2B325922459F017AC1E8775436D11D7F84BD84E11CB64FC9BE110931D0C990CE"
						) {
					return false;
				}
				return true;
			},

			// test checksum exceptions 
			testUncompressedWifShouldFailChecksum: function () {
				// original key: 5KjQAHniFiy18SU7eenyJ9EPYUkjrbiBPfDqw987QjT5vehVQZV   K->k
				var key = "5kjQAHniFiy18SU7eenyJ9EPYUkjrbiBPfDqw987QjT5vehVQZV";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.error.toString().indexOf("failed") == -1) { //Checksum validation failed!
					return false;
				}
				return true;

			},
			testCompressedWifShouldFailChecksum: function () {
				// 	original key: L5g9E16m5zEBZqQgMBouUfL6VwW49vCks1hgyxrPHkN8jNNdWTTk   g->G
				var key = "L5G9E16m5zEBZqQgMBouUfL6VwW49vCks1hgyxrPHkN8jNNdWTTk";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.error.toString().indexOf("failed") == -1) { //Checksum validation failed!
					return false;
				}
				return true;

			},
			// test range of valid private key values for the secp256k1 curve, when specified in hex is 
			// [0x1, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140]
			testBigIntegerZeroShouldSetError: function () {
				var key = "0000000000000000000000000000000000000000000000000000000000000000";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.error == null) { 
					return false;
				}
				return true;

			},
			testBigIntegerOutOfCurveRangeShouldSetError1: function () {
				var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.error == null) {
					return false;
				}
				return true;
			},
			testBigIntegerOutOfCurveRangeShouldSetError2: function () {
				var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364142";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.error == null) {
					return false;
				}
				return true;
			},
			testBigIntegerOutOfCurveRangeShouldSetError3: function () {
				var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
				var btcKey = new Bitcoin.ECKey(key);
				if (btcKey.error == null) {
					return false;
				}
				return true;
			}
		},

		asynchronousTests: {
			//https://en.bitcoin.it/wiki/BIP_0038
			testBip38: function (done) {
				var tests = [
				//No compression, no EC multiply
					["6PRPJs7WmE4GgqQ82SRDmoiVNxkZ7WpxHqP1K9Fkwn3TQajKZ49VTup9dF", "TestingOneTwoThree", "7qsxBmPTEGiV78cDsMFEH5ydaf7atcM1YVEE2FEjCzPAs2qjRNx"],
					["6PRRSkUt2bBmGmGRhYooFbkQtGgnFoVGq7eFaPbWuV3sXGPhLaeqbSRtoV", "Satoshi", "7qtyo7xUFgTCyxS2iPySc1wkdGFem1matLWnNwWhfEJpN4D3DXS"],
				//Compression, no EC multiply
					["6PYL9cddbMn2sfFjvmzzHhGyiyeUumWhRGCEL6NAfAbEUpjnKou3h4z91t", "TestingOneTwoThree", "XHP8moEwyWJAyFJFVup1gW9WhusmTyBgbpL2w4pn4sLRZM8Gbnq9"],
					["6PYLwTUtbnjfB3YAVg2i5PZDbZ8usNAKRyX2eCYbeGjuUWWhoYyPr4dhEH", "Satoshi", "XK3cGME8HmWLXQ1mXXzLeeB4BKmB45QLFPX6Pu71CEXesehNbPDK"],
				//EC multiply, no compression, no lot/sequence numbers
					["6PfQu77ygVyJLZjfvMLyhLMQbYnu5uguoJJ4kMCLqWwPEdfpwANVS76gTX", "TestingOneTwoThree", "5K4caxezwjGCGfnoPTZ8tMcJBLB7Jvyjv4xxeacadhq8nLisLR2"],
					["6PfLGnQs6VZnrNpmVKfjotbnQuaJK4KZoPFrAjx1JMJUa1Ft8gnf5WxfKd", "Satoshi", "5KJ51SgxWaAYR13zd9ReMhJpwrcX47xTJh2D3fGPG9CM8vkv5sH"],
				//EC multiply, no compression, lot/sequence numbers
					["6PgNBNNzDkKdhkT6uJntUXwwzQV8Rr2tZcbkDcuC9DZRsS6AtHts4Ypo1j", "MOLON LABE", "5JLdxTtcTHcfYcmJsNVy1v2PMDx432JPoYcBTVVRHpPaxUrdtf8"],
					["6PgGWtx25kUg8QWvwuJAgorN6k9FbE25rv5dMRwu5SKMnfpfVe5mar2ngH", Crypto.charenc.UTF8.bytesToString([206, 156, 206, 159, 206, 155, 206, 169, 206, 157, 32, 206, 155, 206, 145, 206, 146, 206, 149])/*UTF-8 characters, encoded in source so they don't get corrupted*/, "5KMKKuUmAkiNbA3DazMQiLfDq47qs8MAEThm4yL8R2PhV1ov33D"]
				];

				var waitTimeMs = 60000;

				// running each test uses a lot of memory, which isn't freed
				// immediately, so give the VM a little time to reclaim memory
				function waitThenCall(callback) {
					return function () { setTimeout(callback, waitTimeMs); }
				}

				function log(str) {
					if (document.getElementById("asyncunittestresults")) document.getElementById("asyncunittestresults").innerHTML += str + "<br/>";
					console.log(str);
				}

				var decryptBip38Test = function (test, i, onComplete) {
					ninja.privateKey.BIP38EncryptedKeyToByteArrayAsync(test[0], test[1], function (privBytes) {
						if (privBytes.constructor == Error) {
							log("fail decryptBip38Test #" + i + ", error: " + privBytes.message);
						} else {
							var btcKey = new Bitcoin.ECKey(privBytes);
							btcKey.setCompressed(test[2][0] == 'X');
							if (btcKey.getBitcoinWalletImportFormat() != test[2]) {
								log("fail decryptBip38Test #" + i);
							} else {
								log("pass decryptBip38Test #" + i);
							}
						}
						onComplete();
					});
				};

				var encryptBip38Test = function (test, compressed, i, onComplete) {
					ninja.privateKey.BIP38PrivateKeyToEncryptedKeyAsync(test[2], test[1], compressed, function (encryptedKey) {
						if (encryptedKey === test[0]) {
							log("pass encryptBip38Test #" + i);
						} else {
							log("fail encryptBip38Test #" + i);
							log("expected " + test[0] + "<br/>received " + encryptedKey);
						}
						onComplete();
					});
				};

				// test randomly generated encryption-decryption cycle
				var cycleBip38Test = function (i, compress, onComplete) {
					// create new private key
					var privKey = (new Bitcoin.ECKey(false)).getBitcoinWalletImportFormat();

					// encrypt private key
					ninja.privateKey.BIP38PrivateKeyToEncryptedKeyAsync(privKey, 'testing', compress, function (encryptedKey) {
						// decrypt encryptedKey
						ninja.privateKey.BIP38EncryptedKeyToByteArrayAsync(encryptedKey, 'testing', function (decryptedBytes) {
							var decryptedKey = (new Bitcoin.ECKey(decryptedBytes)).getBitcoinWalletImportFormat();

							if (decryptedKey === privKey) {
								log("pass cycleBip38Test #" + i);
							}
							else {
								log("fail cycleBip38Test #" + i + " " + privKey);
								log("encrypted key: " + encryptedKey + "<br/>decrypted key: " + decryptedKey);
							}
							onComplete();
						});
					});
				};

				// intermediate test - create some encrypted keys from an intermediate
				// then decrypt them to check that the private keys are recoverable
				var intermediateBip38Test = function (i, onComplete) {
					var pass = Math.random().toString(36).substr(2);
					ninja.privateKey.BIP38GenerateIntermediatePointAsync(pass, null, null, function (intermediatePoint) {
						ninja.privateKey.BIP38GenerateECAddressAsync(intermediatePoint, false, function (address, encryptedKey) {
							ninja.privateKey.BIP38EncryptedKeyToByteArrayAsync(encryptedKey, pass, function (privBytes) {
								if (privBytes.constructor == Error) {
									log("fail intermediateBip38Test #" + i + ", error: " + privBytes.message);
								} else {
									var btcKey = new Bitcoin.ECKey(privBytes);
									var btcAddress = btcKey.getBitcoinAddress();
									if (address !== btcKey.getBitcoinAddress()) {
										log("fail intermediateBip38Test #" + i);
									} else {
										log("pass intermediateBip38Test #" + i);
									}
								}
								onComplete();
							});
						});
					});
				}

				var testArray = [
					function (cb) {
						log("running " + tests.length + " tests named decryptBip38Test");
						ninja.forSerialized(0, tests.length, function (i, callback) {
							console.log("running decryptBip38Test #" + i + " " + tests[i]);
							decryptBip38Test(tests[i], i, waitThenCall(callback));
						}, waitThenCall(cb));
					}
					,
					function (cb) {
						log("running 4 tests named encryptBip38Test");
						ninja.forSerialized(0, 4, function (i, callback) {
							console.log("running encryptBip38Test #" + i + " " + tests[i]);
							// only first 4 test vectors are not EC-multiply,
							// compression param false for i = 1,2 and true for i = 3,4
							encryptBip38Test(tests[i], i >= 2, i, waitThenCall(callback));
						}, waitThenCall(cb));
					}
					,
					function (cb) {
						log("running 2 tests named cycleBip38Test");
						ninja.forSerialized(0, 2, function (i, callback) {
							console.log("running cycleBip38Test #" + i);
							cycleBip38Test(i, i % 2 ? true : false, waitThenCall(callback));
						}, waitThenCall(cb));
					}
					,
					function (cb) {
						log("running 5 tests named intermediateBip38Test");
						ninja.forSerialized(0, 5, function (i, callback) {
							console.log("running intermediateBip38Test #" + i);
							intermediateBip38Test(i, waitThenCall(callback));
						}, cb);
					}
				];

				ninja.runSerialized(testArray, done);
			}
		}
	};
})(ninja);