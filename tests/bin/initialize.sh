#!/bin/bash
wp-env run tests-wordpress chmod -c ugo+w /var/www/html
wp-env run tests-cli wp rewrite structure '/%postname%/' --hard

wp-env run tests-cli wp user create user1 user1@example.test --role=author --user_pass=password1
wp-env run tests-cli wp user create user2 user2@example.test --role=author --user_pass=password2
