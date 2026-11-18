# Param Rajyaguru | Portfolio

## Run on Windows

Extract the entire ZIP. With Python 3.8 or newer installed, double-click **start.bat**. The launcher opens the portfolio in your browser on an available local port. Keep the terminal open while using the site. On macOS or Linux run `python3 serve_local.py`.

## Demonstrate the Python backend

Select Contact, enter your name, reply email and message, and submit. The browser sends JSON to the Python endpoint at POST /api/contact. Python validates the fields and commits the submission to contacts.sqlite3 beside start.bat. Messages are stored privately on your computer, and the form confirms success after the write. It does not send email. Run `python inbox.py` in the extracted directory to read the local inbox. Restarting the server keeps the saved messages.

## Hosting

**Netlify Drop frontend.** Drag the extracted **Drop** folder onto https://app.netlify.com/drop. The portfolio, case study and email link work immediately. For the Python form online, configure the backend below. Only the Drop folder belongs in a static deployment.

**Vercel frontend and Python backend.** Import the extracted project root as a repository in Vercel. Use the Other framework preset and the included vercel.json configuration. The static output folder is Drop. The Python handler is api/contact.py. The hosted handler writes to your private Excel Online table so messages survive function restarts.

1. Upload setup/PortfolioContacts.xlsx to the root of your OneDrive, preserving the Contacts table.
2. Register a Microsoft Entra application permitting your Microsoft account type. Enable public client flows and grant delegated Microsoft Graph Files.ReadWrite permission.
3. Run `python setup/authorize.py` from the project root and follow the prompts. Set MS_CLIENT_ID and MS_REFRESH_TOKEN from .env.local as private Vercel environment variables and deploy. Never publish .env.local or contacts.sqlite3.
4. Open Contact on the Vercel URL, send a test message and check the workbook. With both credentials configured locally, the local launcher also uses this workbook.
5. To use the hosted Python service from Netlify Drop, add a file named _redirects inside Drop with the following line, replacing YOUR-PROJECT with the actual hostname. Redeploy the Drop folder and test the form.

       /api/contact https://YOUR-PROJECT.vercel.app/api/contact 200!

The frontend checks whether its backend is enabled. The direct email link remains available on static-only hosting.
