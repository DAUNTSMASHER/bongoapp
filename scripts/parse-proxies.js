const fs = require('fs');
const path = require('path');

const rawData = `ip,anonymityLevel,asn,country,isp,latency,org,port,protocols,speed,upTime,upTimeSuccessCount,upTimeTryCount,updated_at,responseTime
"162.243.55.12","elite","AS14061","US","DigitalOcean, LLC","80","Digital Ocean","59179","socks4","1","100","5082","5085","2026-03-25T20:22:52.518Z","3674"
"67.223.119.155","elite","AS22612","US","Namecheap, Inc.","153","Namecheap, Inc","80","socks4","1","100","1618","1621","2026-03-25T20:22:51.925Z","4481"
"2.136.129.73","elite","AS3352","ES","RIMA (Red IP Multi Acceso)","46","N/A","7016","socks4","1","67","1472","2207","2026-03-25T20:22:51.935Z","4529"
"221.226.188.218","elite","AS4134","CN","CHINANET jiangsu province network","268","N/A","10800","socks4","1","94","932","992","2026-03-25T20:22:51.938Z","3408"
"178.63.84.228","elite","AS24940","DE","Hetzner Online GmbH","11","Hetzner","63158","socks4","1","70","2121","3012","2026-03-25T20:22:51.934Z","4374"
"107.174.121.140","elite","AS36352","US","HostPapa","117","RackNerd LLC","3128","socks4","1","83","9637","11657","2026-03-25T20:22:51.943Z","5099"
"38.83.108.89","elite","AS63199","US","CDS Global Cloud Co., Ltd","121","CDS Global Cloud Co., Ltd","5678","socks4","1","100","3266","3270","2026-03-25T20:22:51.940Z","5075"
"80.89.137.54","elite","AS21127","RU","ZSTTK","98","JSC Zap-SibTranstelecom","4145","socks4","1","30","3496","11794","2026-03-25T20:22:51.926Z","3807"
"103.105.70.9","elite","AS17995","ID","PT iForte Global Internet","181","N/A","30538","socks4","1","100","2537","2549","2026-03-25T20:22:51.933Z","3516"
"221.219.97.117","elite","AS4808","CN","China Unicom Beijing Province Network","234","N/A","1080","socks5","1","56","6587","11772","2026-03-25T20:22:51.945Z","4189"
"49.0.32.177","elite","AS38744","BD","Always On Network Bangladesh Ltd.","177","Always On Network Bangladesh Ltd","10801","socks4","1","96","11215","11725","2026-03-25T20:22:51.937Z","4892"
"103.94.133.94","elite","AS136128","ID","PT CITRA AKSES INDONUSA","169","PT CITRA AKSES INDONUSA","4153","socks5","1","98","11528","11709","2026-03-25T20:22:51.942Z","4880"
"1.10.133.77","elite","AS23969","TH","TOT Public Company Limited","181","Shared Dynamic IP Address for Residential Broadband Services","4145","socks4","65","68","8013","11711","2026-03-25T20:22:51.931Z","791"
"45.65.233.226","elite","AS269822","CO","Colombia MAS TV","179","Netcom Telecomunicaciones","4145","socks4","1","33","1489","4449","2026-03-25T20:22:51.930Z","4795"
"167.172.54.9","elite","AS14061","GB","DigitalOcean, LLC","20","DigitalOcean, LLC","80","socks4","1","100","1200","1201","2026-03-25T20:22:51.928Z","4613"
"116.118.48.208","elite","AS63760","VN","SPT","228","N/A","35050","socks4","1","69","8063","11716","2026-03-25T20:22:32.115Z","3700"
"84.17.35.182","elite","AS60068","US","Datacamp Limited","82","Cdn77 NYC","80","socks4","1","100","1107","1107","2026-03-25T20:22:32.120Z","4711"
"185.244.36.237","elite","AS62068","NL","SpectraIP B.V.","10","SpectraIP B.V.","46139","socks4","1","100","3679","3691","2026-03-25T20:22:32.122Z","4004"
"111.72.198.123","elite","AS4134","CN","Chinanet","251","Chinanet JX","8989","socks4","1","72","3509","4894","2026-03-25T20:22:32.128Z","4203"
"64.90.48.27","elite","AS26347","US","New Dream Network, LLC","143","New Dream Network, LLC","24650","socks5","1","99","11770","11837","2026-03-25T20:22:32.127Z","4400"
"221.151.235.173","elite","AS4766","KR","Korea Telecom","276","Kornet","8080","socks4","1","99","318","320","2026-03-25T20:22:32.123Z","2811"
"167.179.113.181","elite","AS20473","JP","The Constant Company, LLC","230","Choopa, LLC","52333","socks4","1","99","11723","11791","2026-03-25T20:22:32.133Z","4418"
"8.210.150.195","elite","AS45102","HK","Alibaba (US) Technology Co., Ltd.","293","Alibaba.com Singapore E-Commerce Private Limited","26666","socks5","1","98","11457","11734","2026-03-25T20:22:32.120Z","2580"
"192.111.130.5","elite","AS46562","US","Performive LLC","161","Total Server Solutions L.L.C.","17002","socks4","1","96","1737","1816","2026-03-25T20:22:32.133Z","3711"
"178.44.165.196","elite","AS12389","RU","Orenburg branch of OJSC VolgaTelecom","72","OJSC VolgaTelecom","7788","socks5","1","55","2683","4896","2026-03-25T20:22:32.137Z","3499"
"45.88.0.117","transparent","AS208949","PL","Layer IT services","11","Layer IT services","3128","http","12095","100","68","68","2026-03-25T20:22:32.139Z","2109"
"5.135.136.19","elite","AS16276","FR","OVH SAS","18","OVH SAS","12321","socks4","1","100","5006","5007","2026-03-25T20:22:32.229Z","3710"
"64.49.67.164","elite","AS1820","US","WNET TELECOM USA Corp.","111","Everest Broadband Networks","5678","socks4","1","100","4207","4227","2026-03-25T20:22:32.125Z","4307"
"202.162.219.10","elite","AS9341","ID","PT Indonesia Comnets Plus","197","N/A","1080","socks4","1","99","4380","4403","2026-03-25T20:22:32.129Z","4497"
"212.50.19.150","elite","AS8717","BG","Spectrum NET","33","N/A","4153","socks4","1","92","10867","11804","2026-03-25T20:22:32.132Z","3426"
"201.234.24.89","elite","AS265758","AR","Cooperativa De Obras Y Servicios Publicos De Despenaderos Limitada","239","Level 3 Argentina S.A","4153","socks4","1","98","4854","4950","2026-03-25T20:22:32.129Z","4809"
"43.159.28.112","elite","AS132203","SG","Shenzhen Tencent Computer Systems Company Limited","156","Aceville Pte.ltd","19538","socks4","1","100","4976","4980","2026-03-25T20:22:32.135Z","3679"
"125.253.125.132","elite","AS45538","VN","ODS Joint Stock Company","231","ODSJSC","46051","socks4","1","98","11510","11690","2026-03-25T20:22:32.116Z","3717"
"136.226.245.22","elite","AS53813","IN","ZSCALER, INC.","192","Zscaler Softech India Private Limited","8080","socks4","1","94","3677","3903","2026-03-25T20:22:09.232Z","3532"
"179.107.61.81","elite","AS262346","BR","FP Telecomunicacoes Ltda","226","FP Telecomunicacoes Ltda","4145","socks4","1","78","9231","11849","2026-03-25T20:22:09.233Z","4200"
"104.24.82.14","elite","AS13335","CA","Cloudflare, Inc.","11","Cloudflare, Inc.","8080","socks4","1","100","1006","1006","2026-03-25T20:22:09.233Z","4490"
"38.127.172.198","elite","AS174","US","Cogent Communications","85","Torlandia Trading SRL","11537","socks4","1","100","11733","11768","2026-03-25T20:22:09.319Z","2917"
"149.20.253.104","elite","AS18615","US","Mainstream Fiber Networks, LLC","99","Mainstream Fiber Networks, LLC","12551","socks4","1","100","11738","11753","2026-03-25T20:22:09.316Z","2706"
"103.51.44.5","elite","AS133819","ID","CIM","191","N/A","4145","socks4","1","99","11671","11827","2026-03-25T20:22:09.211Z","3598"
"1.20.169.169","elite","AS23969","TH","TOT Public Company Limited","277","TOT Mobile Co LTD","4145","socks4","1","61","3037","4998","2026-03-25T20:22:09.213Z","4463"
"173.212.206.86","elite","AS51167","FR","Contabo GmbH","8","Contabo GmbH","55405","socks5","1","95","11111","11655","2026-03-25T20:22:09.222Z","4882"
"185.82.238.203","elite","AS42908","CZ","O2 Czech Republic, a.s.","22","Nordictelecomregional","5678","socks4","1","94","4752","5041","2026-03-25T20:22:09.226Z","4475"
"45.4.148.142","elite","AS266073","BR","Fausto Silva de Almeida Serviços - ME","188","Fausto Silva de Almeida Serviços - ME","8080","socks4","1","78","945","1216","2026-03-25T20:22:09.226Z","601"
"183.81.157.65","elite","AS24527","ID","PT Hanastar dakara","169","POP Tangerang","5678","socks4","1","98","4997","5079","2026-03-25T20:22:09.224Z","4511"
"110.232.66.3","elite","AS23679","ID","PT. Media Antar Nusa","184","Nusanet MDN","8080","socks4","1","99","4519","4587","2026-03-25T20:22:09.212Z","4484"
"104.168.91.223","elite","AS36352","US","HostPapa","146","N/A","3128","socks5","1","15","1765","11733","2026-03-25T20:22:09.220Z","4768"
"181.78.23.170","elite","AS52468","CO","IFX Networks Argentina S.R.L","172","UFINET COLOMBIA, S. A","4153","socks4","1","69","3512","5079","2026-03-25T20:22:09.147Z","4898"
"23.94.191.218","elite","AS36352","US","HostPapa","94","N/A","1080","socks4","1","100","1841","1844","2026-03-25T20:22:09.227Z","4477"
"66.42.92.212","elite","AS20473","US","The Constant Company","103","Vultr Holdings, LLC","9999","socks4","1","86","10077","11714","2026-03-25T20:22:09.227Z","4601"
"116.99.150.51","elite","AS7552","VN","Viettel Group","198","VIETTEL","36254","socks5","1","41","2011","4931","2026-03-25T20:22:09.221Z","4684"
"129.151.239.175","elite","AS31898","FR","Oracle Corporation","18","Oracle Corporation","8080","socks4","1","100","3787","3788","2026-03-25T20:22:09.221Z","3995"
"185.184.197.98","elite","AS21277","IQ","Allay Nawroz Telecom Company for Communication/Ltd.","74","Tarin General Trading and Setting Up Internet Device LTD","5678","socks4","1","99","11767","11871","2026-03-25T20:22:09.232Z","4783"
"43.134.164.228","elite","AS132203","SG","Aceville Pte.ltd","251","N/A","443","socks5","1","91","10724","11793","2026-03-25T20:22:09.234Z","4174"
"192.111.138.29","elite","N/A","US","Total Server Solutions L.L.C.","166","N/A","4145","socks4","1","95","236","248","2026-03-25T20:22:09.214Z","3600"
"118.172.227.30","elite","AS23969","TH","TOT Public Company Limited","280","TOT Public Company Limited","5678","socks4","1","99","11721","11865","2026-03-25T20:22:09.148Z","3008"
"172.105.43.124","elite","AS63949","IN","Akamai Technologies","133","Linode","13896","socks4","1","100","4163","4183","2026-03-25T20:22:09.315Z","4594"
"110.185.102.103","elite","AS4134","CN","CHINANET SiChuan Telecom Internet Data Center","277","Chinanet SC","51800","socks4","1","91","10680","11745","2026-03-25T20:21:35.916Z","3197"
"185.89.156.130","elite","AS198279","AL","ATU","36","N/A","5678","socks4","1","99","11678","11765","2026-03-25T20:21:35.941Z","1494"
"192.163.200.93","elite","AS46606","US","Unified Layer","134","Unified Layer","18646","socks4","1","96","4543","4728","2026-03-25T20:21:35.940Z","4394"
"212.3.104.126","elite","AS6702","UA","Science Production Company \"Trifle\" Ltd.","40","Apex","8080","socks5","3","100","5072","5089","2026-03-25T20:21:35.913Z","4383"
"105.214.36.131","elite","AS16637","ZA","MTN SA","185","MTN SA","5678","socks4","1","66","3356","5049","2026-03-25T20:21:35.917Z","3899"
"167.103.19.22","elite","AS53813","IN","ZSCALER, INC.","185","Zscaler Softech India Private Limited","11194","socks4","1","99","4380","4430","2026-03-25T20:21:35.914Z","216"
"123.200.26.134","transparent","AS23688","BD","Link3 Technologies Limited","182","Link3 Technologies Ltd","4126","http","10120","100","28","28","2026-03-25T20:21:35.919Z","551"
"45.144.30.232","elite","AS33993","RU","UFO Hosting LLC","46","UFO Hosting LLC","443","socks4","1","84","4285","5078","2026-03-25T20:21:35.942Z","3875"
"103.66.176.45","elite","AS135578","BD","Dhaka Information Tecnology-DIT","182","N/A","32251","socks4","1","98","4560","4669","2026-03-25T20:21:35.912Z","4704"
"45.56.220.210","elite","AS40092","CA","HostPapa","96","N/A","58732","socks4","1","100","4506","4521","2026-03-25T20:21:35.941Z","2810"
"89.161.89.161","elite","AS39375","PL","Telekomunikacja Podlasie sp. z o.o.","27","TPODLASIE CATV Network","5678","socks4","1","100","11787","11838","2026-03-25T20:21:35.921Z","4218"
"123.59.100.247","elite","AS23724","CN","CloudVsp.Inc","226","N/A","1080","socks4","1","90","10659","11789","2026-03-25T20:21:03.315Z","3013"
"104.255.170.63","elite","AS397373","US","H4Y Technologies LLC","135","N/A","60899","socks5","1","100","11838","11890","2026-03-25T20:21:03.323Z","5004"
"172.104.49.195","elite","AS63949","SG","Akamai Technologies","241","Linode","8080","socks4","1","100","4322","4339","2026-03-25T20:21:03.333Z","3675"
"167.99.12.224","elite","AS14061","US","DigitalOcean, LLC","80","Digital Ocean","49463","socks4","1","96","11314","11738","2026-03-25T20:21:03.332Z","4769"
"101.51.124.223","elite","AS23969","TH","TOT Public Company Limited","190","TOT Public Company Limited","4145","socks4","1","47","5623","11845","2026-03-25T20:21:03.324Z","3608"
"8.218.205.195","elite","AS45102","HK","Alibaba (US) Technology Co., Ltd.","307","Alibaba.com Singapore E-Commerce Private Limited","5555","socks5","1","79","9241","11758","2026-03-25T20:21:03.331Z","4691"
"110.42.188.54","elite","AS45090","CN","China Internet Network Information Center","262","Tencent cloud computing (Beijing) Co., Ltd.","2080","socks5","1","77","9168","11897","2026-03-25T20:21:03.322Z","3683"
"62.210.201.140","elite","AS12876","FR","Online S.A.S.","9","ONLINE","17937","socks4","1","69","1330","1941","2026-03-25T20:21:03.313Z","1789"
"116.102.34.91","elite","AS7552","VN","Viettel Group","170","VIETTEL","10040","socks4","1","62","1169","1876","2026-03-25T20:21:03.326Z","4881"
"103.110.184.1","elite","AS137374","ID","Dinas Komunikasi","248","N/A","6037","socks4","1","99","11717","11829","2026-03-25T20:21:03.317Z","4123"
"1.10.134.210","elite","AS23969","TH","TOT Public Company Limited","189","Shared Dynamic IP Address for Residential Broadband Services","4145","socks4","1","67","1450","2173","2026-03-25T20:21:03.334Z","4098"
"121.33.160.26","elite","AS4134","CN","Chinanet","253","Chinanet GD","4145","socks4","1","44","2229","5031","2026-03-25T20:21:03.328Z","4496"
"184.170.249.65","elite","AS46562","US","Performive LLC","152","Performive LLC","4145","socks4","1","96","307","320","2026-03-25T20:21:03.314Z","4815"
"83.53.207.196","elite","AS3352","ES","Telefonica de Espana SAU","44","RIMA (Red IP Multi Acceso)","4145","socks4","1","99","11603","11739","2026-03-25T20:21:03.327Z","2394"
"203.24.108.194","elite","AS209242","CY","Cloudflare London, LLC","11","Lachtaristo Holdings Limited","80","socks4","1","100","11663","11667","2026-03-25T20:21:03.323Z","4992"
"45.249.79.105","elite","AS18229","IN","Tejasri Communications","175","N/A","3629","socks4","1","99","4972","4999","2026-03-25T20:20:53.222Z","3689"
"103.23.100.1","elite","AS58400","ID","Universitas Negeri Semarang, y","177","UNNES","4145","socks4","1","100","3433","3445","2026-03-25T20:20:53.239Z","4679"
"49.0.88.27","elite","AS133481","TH","AIS-Fibre","194","N/A","8080","socks4","1","84","4261","5066","2026-03-25T20:20:53.228Z","3803"
"89.148.250.140","elite","AS15640","RU","MTS PJSC","83","CCL Home17","7788","socks5","1","25","1230","4896","2026-03-25T20:20:53.241Z","4876"
"31.170.19.5","elite","AS42099","LV","DNET ITRisinajumi Ltd.","37","Sia Nano IT","4153","socks4","1","100","11777","11813","2026-03-25T20:20:53.222Z","4489"
"213.96.98.213","elite","AS3352","ES","Telefonica De Espana SAU","31","TDENET (Red de servicios IP)","15724","socks4","1","99","11634","11707","2026-03-25T20:20:53.233Z","4884"
"190.145.132.250","elite","AS14080","CO","Telmex Colombia S.A.","152","Telmex Colombia S.A.","4145","socks4","1","63","7386","11752","2026-03-25T20:20:53.228Z","3777"
"110.78.149.110","elite","AS131090","TH","CAT-BB","190","N/A","4145","socks4","1","74","8757","11758","2026-03-25T20:20:53.235Z","4899"
"188.164.197.178","elite","AS50926","ES","AXARNET COMUNICACIONES, S.L.","63","AXARNET COMUNICACIONES, S.L","55677","socks4","1","98","4946","5057","2026-03-25T20:20:53.327Z","2680"
"197.234.13.78","elite","AS36902","SC","Intelvision","126","Intelvision Ltd","4145","socks4","1","99","11628","11722","2026-03-25T20:20:53.234Z","4387"
"45.7.177.245","elite","AS266626","BR","Litoral Telecom","232","Litoral Telecom","39867","socks4","1","49","5746","11825","2026-03-25T20:20:53.225Z","4575"
"104.248.155.139","elite","AS14061","SG","DigitalOcean, LLC","332","DigitalOcean, LLC","8118","socks4","1","85","3656","4295","2026-03-25T20:20:53.241Z","3689"
"192.154.208.135","elite","AS64200","US","Vivid-hosting LLC","151","Vivid-hosting LLC","9000","socks4","1","100","3991","3995","2026-03-25T20:20:53.227Z","4126"
"42.96.12.212","elite","AS135967","VN","Bach Kim Network solutions Join stock company","197","Bach Kim Network solutions Join stock company","35642","socks5","1","27","172","642","2026-03-25T20:20:53.236Z","3979"
"182.253.152.76","elite","AS17451","ID","BIZNET","171","N/A","8080","socks4","1","97","1571","1613","2026-03-25T20:20:53.230Z","4572"
"181.78.64.237","elite","AS52468","CO","IFX Networks Argentina S.R.L","182","UFINET COLOMBIA, S. A","999","socks4","1","99","1808","1827","2026-03-25T20:20:53.244Z","3278"
"124.160.173.7","elite","AS4837","CN","CNC Group CHINA169 Zhejiang Province Network","200","N/A","3128","socks4","1","99","2386","2407","2026-03-25T20:20:53.219Z","4411"
"174.77.111.198","elite","AS22773","US","Cox Communications Inc.","178","Cox Communications","49547","socks4","1","63","266","423","2026-03-25T20:20:53.243Z","4125"`;

const lines = rawData.split('\n');
const parsed = lines.slice(1).map(line => {
    // Simple CSV parser that handles quoted commas
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);

    if (parts.length < 9) return null;
    const ip = parts[0];
    const port = parts[7];
    const protocol = parts[8].split(',')[0].trim(); // Take first protocol if multiple
    if (!ip || !port || !protocol) return null;
    return `${protocol}://${ip}:${port}`;
}).filter(p => p);

fs.writeFileSync(path.join(__dirname, 'proxies.txt'), parsed.join('\n'));
console.log(`Successfully parsed and saved ${parsed.length} proxies with robust comma handling.`);
