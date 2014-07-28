<h1>Discogs Embed</h1>

<form class="form discog-embed-settings">
    <div class="row">
        <div class="col-sm-6">
            <div class="form-group">
                <label for="clientId">Client ID/Secret Pair</label>
                <div class="row">
                    <div class="col-xs-5">
                        <input type="text" class="form-control" id="clientId" name="clientId" placeholder="Client ID" />
                    </div>
                    <div class="col-xs-7">
                        <input type="text" class="form-control" id="clientSecret" name="clientSecret" placeholder="Client Secret" />
                    </div>
                </div>
                <span class="help-block">Required* Visit <a href="https://www.discogs.com/settings/developers">Discogs</a> to obtain an API key & Secret.</span>
            </div>
            <div class="form-group">
                <label for="cacheHours">Number of hours to cache album data</label>
                <input type="text" class="form-control" id="cacheHours" name="cacheHours" placeholder="24" />
                <span class="help-block">To reduce the number of calls to Discogs, this plugin will remember album data for a specified number of hours. (Default: 24)</span>
            </div>
        </div>
    </div>

    <button type="button" class="btn btn-lg btn-primary" id="save">Save</button>
</form>

<script type="text/javascript">
    require(['settings'], function(Settings) {
        Settings.load('discogs-embed', $('.discogs-embed-settings'));

        $('#save').on('click', function() {
            Settings.save('discogs-embed', $('.discogs-embed-settings'), function() {
                app.alert({
                    alert_id: 'discogs-embed',
                    type: 'info',
                    title: 'Settings Changed',
                    message: 'Please restart your NodeBB to apply these changes',
                    timeout: 5000,
                    clickfn: function() {
                        socket.emit('admin.restart');
                    }
                });
            });
        });
    });
</script>