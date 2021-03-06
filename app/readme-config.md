Diligent search Configuration
==========


## Apache configuration

In order to make the project work locally, a specific Apache configuration is needed
*You can find a copy of the apache configuration used to develop the project. Go to 001-diligentsearch.conf and update it according to your environment.*

### Linux and Apache2

Go to /etc/apache2/sites-available
Activate your Root access if not already done



Get the default configuration pattern and create a new one from it and edit it (for example 001-diligentsearch.conf)

	cp 000-default.conf 001-diligentsearch.conf

Enable serverName 
	
	serverName diligentsearch.local

Set the DirectoryRoot to the location of the index.html master main file of project
	
	DocumentRoot /home/user/diligentsearch-website/app
	<Directory /home/user/diligentsearch-website/app>
	        Require all granted
	</Directory>
	Header set Access-Control-Allow-Origin "*"
	ProxyPass "/api" "http://localhost:8888"
	ProxyPassReverse "/api" "http://localhost:8888"

*There is no final slash '/' at the end of the DocumentRoot*

The 8000 port is used by default in several nodeJS servers, so 8888 should be available. change it if already used. To check by which app it is used, run this command as root :

	netstat -tulpn


The ProxyPass route is required to perform GET & POST requests to the server.

Enable the Header configuration
	
	a2enmod headers

Enable the rewrite engine, to access pretty URL

	a2enmod rewrite

Enable this new apache2 configuration with the following commands

	a2ensite 001-diligentsearch.conf

	service apache2 reload


Set the serverName used as a valid IP address

	nano /etc/hosts
	127.0.0.1	diligentsearch.local

The index.html file located in /home/user/diligentsearch-website will be available at the diligentsearch.local URL





## PhpMyAdmin configuration

This application requires access to a MySQL database, to install it, type the following command:

	sudo apt-get install mysql-server


To simplifie DB management and visualization, we will use the phpmyadmin dashboard

Download phpmyadmin package

	sudo add-apt-repository ppa:nijel/phpmyadmin

	sudo apt-get update

	sudo apt-get install phpmyadmin

Configure phpmyadmin

	Choose apache2 as a default HTTP server
	Choose to confugure the mysql db : password = diligentsearch


Access the dashboard

	Create symbolic link between phpMyAdmin and apache2 default configuration:
	sudo ln -s /usr/share/phpmyadmin/ /var/www/html/phpmyadmin

	Restart apache2 to activate changes:
	sudo /etc/init.d/apache2 restart

	To access phpmyadmin dashboard, go to 
	http://localhost/phpmyadmin

	If you have difficulties to login, refer to the following file:
	/etc/phpmyadmin/config-db.php
	The '$dbuser' and '$dbpass' are the login/password



## MySQL Database configuration

The application will require a specific database we will manage from the previsouly installed/configured dashboard.

Privileges are required for your new phpmyadmin user to create databases from the dashboard. To set him privileges, open up a mysql shell as the mysql root user: 

	mysql -u root -p

Type in the following commands:

	GRANT ALL PRIVILEGES ON *.* TO 'phpmyadmin'@'localhost' WITH GRANT OPTION;
	FLUSH PRIVILEGES;
	
Refer to this if there are problems:

	http://askubuntu.com/questions/763336/cannot-enter-phpmyadmin-as-root-mysql-5-7

Create a database, and use the given schema, available in the root folder of the project.

	// within mysql shell
	create database diligent_search;

	// Outside of mysql shell
	mysql -u root -p diligent_search < diligentsearch-schema.sql




## Server configuration

Important, the apache2 configuration explained before has to match with content of the server.js file.
*especially server port on which server will be listening*

Besides, the Header configuration is crucial to enable ajax calls from the client to the server

The server is written with nodeJs. First, download dependecies by fetching packages specified in the package.json file:

	// Go to server/
	npm install

Database access configuration available in the file 'db-config.js':

	Change host, user and password if needed to match your database configuration
	
To test if database connection is correctly set, run the following command:

	//Go to server/
	node server.js

	//And vist the page diligentsearch.local/api
	//It should display the welcome message


The server requires a third party software to generate pdf : wkhtmltopdf

## PDF generation : wkhtmltopdf

The precompiled sources can be found here :

	http://wkhtmltopdf.org/downloads.html

Grab the sources, extract them somewhere, and add the executable to the path of your system

Under Ubuntu / Debian, you can do the following :

	cp <path/to/executable/third-party-software>/wkhtmltopdf $HOME/bin/
	export PATH=$PATH:$HOME/bin

Reset shell session to enable changes

If the installation and the binding correct, wkhtmltopdf is available as a command line.

Thus wkhtmltopdf is required by the server to generate pdf reports.
