const ADMIN_PASSWORD = "Ajinkyajadhao1769";

const adminLogin =
sessionStorage.getItem("shadowAdminLogin");

if(adminLogin !== "true"){

    const pass =
    prompt("Enter Shadow Admin Password");

    if(pass === ADMIN_PASSWORD){

        sessionStorage.setItem(
            "shadowAdminLogin",
            "true"
        );

    }else{

        document.body.innerHTML = `

        <div style="
        min-height:100vh;
        display:grid;
        place-items:center;
        background:#030712;
        color:white;
        font-family:Poppins,sans-serif;
        text-align:center;
        padding:30px;
        ">

            <div style="
            max-width:600px;
            padding:40px;
            border-radius:28px;
            background:rgba(7,18,35,.92);
            border:1px solid rgba(0,200,255,.3);
            box-shadow:0 0 45px rgba(0,200,255,.25);
            ">

                <h1 style="
                color:#00c8ff;
                text-shadow:0 0 20px #00c8ff;
                ">
                    SHADOW SECURITY
                </h1>

                <h2>
                    Access Denied
                </h2>

                <p style="color:#9fb4c9;">
                    You are not authorized to open this admin page.
                </p>

                <a href="index.html" style="
                display:inline-block;
                margin-top:20px;
                padding:13px 20px;
                border-radius:15px;
                background:#00c8ff;
                color:#00111c;
                text-decoration:none;
                font-weight:900;
                ">
                    Return Home
                </a>

            </div>

        </div>

        `;

        throw new Error("Blocked");

    }

}

/* AUTO LOGOUT AFTER 30 MINUTES */

let lastActivity = Date.now();

document.addEventListener("mousemove",()=>{
    lastActivity = Date.now();
});

document.addEventListener("keydown",()=>{
    lastActivity = Date.now();
});

setInterval(()=>{

    const now = Date.now();

    const diff =
    now - lastActivity;

    if(diff > 30 * 60 * 1000){

        sessionStorage.removeItem(
            "shadowAdminLogin"
        );

        alert("Admin session expired");

        location.reload();

    }

},5000);

/* TAB SWITCH DETECT */

document.addEventListener(
"visibilitychange",
()=>{

    if(document.hidden){

        console.log(
        "Admin tab hidden"
        );

    }

});

/* DEVTOOLS DETECT */

setInterval(()=>{

    if(
        window.outerWidth -
        window.innerWidth > 160 ||

        window.outerHeight -
        window.innerHeight > 160
    ){

        console.clear();

        console.log(
        "%cSHADOW SECURITY ACTIVE",
        "color:#00c8ff;font-size:22px;font-weight:bold;"
        );

    }

},1000);