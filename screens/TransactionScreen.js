import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as firebase from "firebase";
import db from "../config.js";

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedBookId: "",
      scannedStudentId: "",
      buttonState: "normal",
      transactionMessage: "",
      submitButtonState: true,
    };
  }
  initiateBookIssue = async () => {
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue",
    });
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: false,
    });
    db.collection("students")
      .doc(this.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });
    alert("Book Issued");
    this.setState({
      scannedBookId: "",
      scannedStudentId: "",
    });
  };
  initiateBookReturn = async () => {
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return",
    });
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: true,
    });
    db.collection("students")
      .doc(this.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });
    alert("Book Returned");
    this.setState({
      scannedBookId: "",
      scannedStudentId: "",
    });
  };
  checkBookAvailability = async () => {
    const bookRef = await db
      .collection("books")
      .where("bookId", "==", this.state.scannedBookId)
      .get();
    var transactionType = "";
    if (bookRef.docs.length == 0) {
      transactionType = false;
      console.log(bookRef.docs.length);
    } else {
      bookRef.docs.map((doc) => {
        var book = doc.data();
        if (book.bookAvailability) {
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }
    return transactionType;
  };
  handleTransaction = async () => {
    // var transactionMessage
    // db.collection("books").doc(this.state.scannedBookId).get()
    // .then((doc)=>{
    //     //snapshot.forEach((doc)=>{
    //       var book = doc.data()
    //       if(book.bookAvailability){
    //           this.initiateBookIssue();
    //           transactionMessage = "Book Issued"
    //           ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
    //           // Alert.alert(transactionMessage)
    //       }
    //       else{
    //           this.initiateBookReturn();
    //           transactionMessage = "Book Returned"
    //           ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
    //           // Alert.alert(transactionMessage)
    //       }
    // })

    // this.setState({
    //   transactionMessage: transactionMessage
    // })
    var transactionType = await this.checkBookAvailability();
    console.log(transactionType);
    if (!transactionType) {
      Alert.alert("This Book Doesn't Exist in the Database");
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        Alert.alert("Book Issued");
      }
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();
        Alert.alert("Book Returned");
      }
    }
  };
  checkStudentEligibilityForIssue = async () => {
    const studentRef = await db
      .collection("students")
      .where("studentId", "==", this.state.scannedStudentId)
      .get();
    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
      isStudentEligible = false;
      Alert.alert("This Student Id does not Exist in the Database");
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.numberOfBooksIssued < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          Alert.alert("This Student Id already has 2 Books Issued");
          this.setState({
            scannedBookId: "",
            scannedStudentId: "",
          });
        }
      });
    }
    return isStudentEligible;
  };
  checkStudentEligibilityForReturn = async () => {
    const transactionRef = await db
      .collection("transaction")
      .where("bookId", "==", this.state.scannedBookId)
      .limit(1)
      .get();
    var isStudentEligible = "";
    transactionRef.docs.map((doc) => {
      var lastBookTransaction = doc.data();
      if (lastBookTransaction.studentId === this.state.scannedStudentId) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        Alert.alert("This Book wasn't Issued to this Student Id");
        this.setState({
          scannedBookId: "",
          scannedStudentId: "",
        });
      }
    });
    return isStudentEligible;
  };

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };

  handleBarCodeScanner = async ({ type, data }) => {
    const { buttonState } = this.state;

    if (buttonState === "BookId") {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: "normal",
      });
    } else if (buttonState === "StudentId") {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: "normal",
      });
    }
    setSubmitButtonState();
  };
  setSubmitButtonState = () => {
    if (this.state.scannedStudentId == "" || this.state.scannedBookId == "") {
      this.setState({ submitButtonState: true });
      //console.log(submitButtonState);
    } else {
      this.setState({ submitButtonState: false });
    }
  };
  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;
    const submitButtonState = this.state.submitButtonState;

    if (buttonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanner}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === "normal") {
      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled
        >
          <View>
            <Image
              source={require("../assets/booklogo.jpg")}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ textAlign: "center", fontSize: 30 }}>Wily</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={(text) => this.setState({ scannedBookId: text })}
              value={this.state.scannedBookId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("BookId");
                // this.setSubmitButtonState();
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={(text) => this.setState({ scannedStudentId: text })}
              value={this.state.scannedStudentId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("StudentId");
                //this.setSubmitButtonState();
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            disabled={submitButtonState}
            style={styles.submitButton}
            onPress={async () => {
              var transactionMessage = this.handleTransaction();
              this.setState({ scannedBookId: "", scannedStudentId: "" });
            }}
          >
            <Text
              style={
                submitButtonState
                  ? styles.submitButtonText
                  : { fontWeight: "underline" }
              }
            >
              Submit
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },
  scanButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 10,
  },
  submitButton: {
    backgroundColor: "#FBC02D",
    width: 100,
    height: 50,
  },
  submitButtonText: {
    padding: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
