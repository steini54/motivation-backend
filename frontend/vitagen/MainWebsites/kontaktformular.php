<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $prename = htmlspecialchars($_POST['prename']);
    $name = htmlspecialchars($_POST['name']);
    $strasse = htmlspecialchars($_POST['strasse']);
	$plzort = htmlspecialchars($_POST['plzort']);
    $firm = htmlspecialchars($_POST['firm']);
    $telephon = htmlspecialchars($_POST['telephon']);
    $mail = htmlspecialchars($_POST['mail']);
    $products = htmlspecialchars($_POST['products']);

    $to = "info@syntext.ch"; // Deine E-Mail-Adresse
    $subject = "Neue Kontaktanfrage";
    $message = "Es wurde eine neue Kontaktanfrage gesendet:\n\n";
    $message .= "Vorname: $prename\n";
    $message .= "Nachname: $name\n";
    $message .= "Strasse: $strasse\n";
	$message .= "PLZ/Ort: $plzort\n";
    $message .= "Firma: $firm\n";
    $message .= "Telefon: $telephon\n";
    $message .= "E-Mail: $mail\n";
    $message .= "Anforderung: $products\n";

    $headers = "From: info@syntext.ch";

    if (mail($to, $subject, $message, $headers)) {
        echo "Vielen Dank! Deine Nachricht wurde gesendet. Der erste Schritt ist gemacht, jetzt sind wir an der Reihe. Wir melden uns so schnell es geht bei Dir!";
    } else {
        echo "Fehler beim Senden. Bitte versuchen Sie es später erneut.";
    }
}
?>