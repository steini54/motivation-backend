stairwayguide

Jun 07, 3:33 PM
Hello Deni, you still here?

I am looking for an experienced AI developer to help me integrate and use Google's image generation model (often referred to as "Nano Banana" / Gemini Flash Image).

Current situation:

I already have a Google AI Studio account.
Billing is active and linked to my project.
I have multiple Gemini API keys available.
The project is fully set up and ready for development.
Previous freelancers kept referring to "Nano Banana" but could not clearly explain what additional setup was required.

What I need:

Verify that my existing Google AI Studio setup is sufficient.
Confirm access to the correct Gemini image-generation model.
Build a simple working implementation (web app, script, or API integration).
Demonstrate successful image generation using my existing API credentials.
Provide clear documentation on how to use and maintain the solution.

Please explain:

What technology stack you would use.
How many hours you estimate for the work.
Whether my current Gemini API keys and billing setup are sufficient.
Any additional access or permissions you would require.

Budget:
I expect this to be a relatively small project and estimate a budget of approximately USD 100. Please provide your fixed-price quote and estimated delivery time.

Thank you, and I look forward to hearing from you.

S
stairwayguide

Jun 07, 3:37 PM
The Freelancer i work with installed the railway setup - which is now working. but he keeps telling me to use nano banana, even though i have a billing account on google gemini and several API keys. The problem is that the current implementation generates images from text prompts only, and the results look completely different every time.

What I actually need is image-to-image generation and editing, where an existing image is used as the reference and the AI modifies or improves it while preserving the original character, style, composition, branding, and visual identity.

I would appreciate your professional assessment of the following:

What AI model would you recommend for this use case?
Is Google's Gemini Flash Image ("Nano Banana") the right solution, or would you recommend another model?
How would you implement consistent image-to-image editing?
What level of visual consistency can realistically be achieved?
How long would implementation take?
What would be a realistic budget for a first working version?

My goal is not to generate completely new images from text, but to create controlled variations and edits of existing images while maintaining a consistent visual appearance.

S
stairwayguide

Jun 07, 3:39 PM
Take your time by analysing my google translated request. Hope to hear from you. Greetings Thomas

D
Profile Image
Me

Jun 07, 4:00 PM
Hi Thomas,
yes, I’m here — and thank you for the clear explanation.

I understand your need. What you want is not just text-to-image, but image-to-image editing with consistency — meaning the model should use an existing image as reference and modify it while preserving the original style, character, composition, and branding as much as possible.

Yes, Google Gemini’s native image models can support this workflow, so the first step would be to verify which image model your current API keys can access and then test it properly with your existing setup.

This is actually very similar to a previous project I handled, where I implemented consistent image generation and editing for a client using GPT-Images-2. I can attach an example image from that project for reference.

My proposed scope
verify your Google AI Studio / billing / API key access
confirm the correct Gemini image model
build a simple working image-to-image implementation
test consistent editing with your current setup
provide clear usage documentation
Proposal
Fixed price: $150
Delivery time: 3 days

If you’d like, I can start with a first working version and test it directly with your current API credentials.

Best regards,
Deni


Screenshot 2026-06-04 185832.png

(113.65 kB)

S
stairwayguide

Jun 07, 4:36 PM
Hi Deni. Thanks for your quick response. Did you checked the two functions on my website already? one is the image to image, the other one is below (single words to full text). both are not working. i guess because of the API Keys (they used to work due to the fixing process with the other specialist). They fixed railway, but also told me, that the Keys are not working. Do you need a pdf-order and the passwords to railway, github and  hosttech (my web-provider)?

D
Profile Image
Me

Jun 07, 4:47 PM
Hi Thomas, thanks for the clarification.

In that case, the scope is a bit broader than only building a small Gemini image-to-image demo, because I would also need to audit and fix the two existing functions that are currently not working:

1. image-to-image editing
2. single-word / keyword-to-full-text generation

Yes, this may be related to the API keys, but I need to verify it properly by checking the code, Railway logs, environment variables, Gemini model access, and the actual API responses.

For security, I recommend using collaborator invitations instead of sharing personal passwords directly. Ideally, I would need:

* GitHub access to review and update the code
* Railway access with sufficient permission to check logs, env variables, and redeploy
* Google AI Studio / Google Cloud Console access to verify API keys, billing, enabled API, and model access
* the brief/order PDF
* the live website URL for testing

Hosttech access may only be needed later if the issue is related to the domain, hosting, frontend configuration, or CORS from the live website.

For this updated scope, I can do it for **$170 fixed price with 3 days delivery**.

This would include the audit, fixing both broken functions, verifying the Gemini API/model setup, testing the result, and providing short documentation of what was fixed.

Best regards,
Deni

D
Profile Image
Me

Jun 07, 4:51 PM
Just to clarify one point: I haven’t checked the two website functions directly yet because I don’t have the live website URL or project access at the moment.

Once you send the website URL and the brief PDF, I can first review the visible issue. After the order starts, I can then proceed with the technical audit through GitHub, Railway, and Google AI Studio / Google Cloud Console access.

S
stairwayguide

Jun 07, 5:06 PM
my website is https://syntext.ch/ scroll down to the button named "VitaGen". Once you clicked on it, there are two options appearing. choose "motivationsschreiben" - there you have the two functions "KI Foto generieren" and further below "KI Hilfe zum Fliesstext erstellen" applied.


Bewerbungsgenerator_Project_Brief.pdf

(2.44 kB)

D
Profile Image
Me

Jun 07, 5:42 PM
Hi Thomas, I also did a quick visible test on the website.

Both buttons are triggered from the frontend, but the system does not receive a valid AI result back. The photo function returns no generated image, and the text function returns no generated text.

So the issue looks more related to the backend/API integration side, such as API key/model access, Railway environment variables, backend response handling, or deployment configuration — not simply the visible UI.

For this scope, I can proceed with the $170 fixed price / 3 days delivery offer. After the order starts, please invite me to GitHub, Railway, and Google AI Studio / Google Cloud Console with sufficient permissions to check the implementation, logs, API/model access, environment variables, and redeploy if needed.

Hosttech access may only be needed later if the issue is connected to the live hosting, domain, frontend files, or CORS configuration.

D
Profile Image
Me

Jun 07, 5:43 PM
Here's your custom offer

$170
I will be your vibe coder for any custom app or ai concept
I will audit and fix the two AI-powered functions in your Bewerbungsgenerator / VitaGen website:

1. KI Foto generieren
2. KI Hilfe zum Fließtext erstellen

Initial testing shows that both frontend buttons are triggered, but the website does not receive a valid generated image or generated text back from the AI backend.

This offer includes checking the existing GitHub code, Railway deployment, environment variables, Gemini API/model access, frontend-backend connection, backend response handling, possible routing/CORS issues, endpoint testing, and a short documentation of what was fixed.

This scope does not include payment integration, watermark system, premium download system, or additional AI features.

Read more
Your offer includes

3 Days Delivery

Number of APIs integrated - 1

Deployment & hosting configuration - 1

Security and compliance audit - 1

View order
D
Profile Image
Me

Jun 07, 5:44 PM
Please provide collaborator access/invitations for:

1. GitHub repository
2. Railway project
3. Google AI Studio / Google Cloud Console
4. Hosttech only if needed later for hosting/domain/frontend/CORS checks

Please also confirm which Gemini API key/project should be used for production.

D
Profile Image
Me

Jun 07, 6:10 PM
Please send the collaborator invitations to this email:
deniifirdaus207 @ gmail.com
GitHub, Railway, and Google AI Studio / Google Cloud Console access should be enough for the initial audit.

S
stairwayguide

Jun 07, 7:00 PM
Ok - done. If there is any problem or you need anything, just let me know.

S
stairwayguide

Jun 07, 7:06 PM
Addition: Im not sure about the hosttech login. there are two different ones. one is for the backend (i allready sent per mail), and this one is for the main site: steini54 at hotmail adresse with the login steini54-Ichbins

D
Profile Image
Me

Jun 07, 7:36 PM
Thank you, Thomas. I will check the invitations once the Fiverr offer is accepted and the order is officially active.

For now, GitHub, Railway, and Google AI Studio / Google Cloud Console should be enough for the initial audit. I will only use Hosttech later if it is really needed for the main website, hosting, domain, or CORS/frontend configuration.

Once the order starts, I’ll begin checking the setup and let you know if anything is missing.

D
Profile Image
Me

Jun 07, 7:55 PM
Hi Thomas, I received your email, thank you.

For security reasons, I would prefer not to use direct account logins/passwords if possible. It is safer to invite me as a collaborator instead.

Also, many of these logins may require verification codes from email during login, which can slow down the process. Collaborator invitations will be much cleaner and faster.

Please invite me to the GitHub repository, Railway project, and Google AI Studio / Google Cloud Console to my gmail.
After the order is officially active, I will start checking everything.

S
stairwayguide

Jun 07, 7:55 PM
Did you login on railway? The Code is 248122

D
Profile Image
Me

Jun 08, 8:31 AM
Hi Thomas, thanks for the code.

Before I continue checking Railway, please accept the custom offer first so the order is officially active on Fiverr.

Once it starts, I’ll continue the access check and begin the audit/fix.

D
Profile Image
Me

Jun 08, 8:35 AM
Hi Thomas, one quick question: where is the frontend/main website currently deployed?

Is the VitaGen frontend hosted on Hosttech, or is it deployed from another platform/repository?

This will help me know whether I only need Railway/GitHub/Google access, or if Hosttech access is also required.

S
stairwayguide

Jun 08, 4:51 PM
Hi Deni. good question to someone who doesn`t know that much about it, but i hope i can help with this question: The whole VitaGen datas/files are on hosttech. Because of the function i need, i had to upload the files on github and railway. Hope that helps.

S
stairwayguide

Jun 08, 5:00 PM
Also i have acceptet the order. What is your account name that i can add as a collaborator?

S
stairwayguide

Jun 08, 5:01 PM
One more request for later. Could you give me an objective assessment of the different selectable styles? How do you find the format and the selection?

S
stairwayguide

Jun 08, 5:44 PM
I added you on github but couldnt add you on the free-plan railway. To add you on the google AI studio, i need your e-mail adresse. Thanks and Greetings, Thomas

S
stairwayguide

Jun 08, 5:51 PM
Found the e-mail on your website.

S
stairwayguide

Jun 08, 5:53 PM
I was able to add you on google cloud aswell. If you need anything more, just let me know. Thanks, Thomas


image.png

(266.9 kB)

D
Profile Image
Me

Jun 08, 6:50 PM
Hi Thomas, thank you. I can confirm that I have access to Google Cloud now, and I will also check the GitHub invitation.

That information helps: the VitaGen frontend files are on Hosttech, while the AI backend is connected through GitHub/Railway.

I will start with the technical audit now: GitHub code, Google/Gemini setup, backend configuration, and then Railway if needed. Since Railway cannot add collaborators on the free plan, I may ask you for a verification code later only if I need to check logs, environment variables, or redeploy.

Regarding the selectable styles: yes, after the main AI functions are fixed, I can also give you a short objective assessment of the style options and format.

S
stairwayguide

Jun 08, 7:25 PM
Sounds like a plan - Thank you and good luck

D
Profile Image
Me

Jun 08, 7:28 PM
Thank you Thomas, I’ll start the audit now and keep you updated if I need anything else.