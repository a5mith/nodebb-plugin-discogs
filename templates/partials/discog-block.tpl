<div class="row">
    <!-- BEGIN discoginfo -->
        <div class="discogs">
            <div class="discog-info panel panel-default">
                <div class="panel-body">
                    <div class="meta pull-left">
                        <img title="{discoginfo.catno}" src="{discoginfo.thumbnail}" class="discogs-picture">
                    </div>
                    <div class="stats pull-left">
                        <a target="_blank" href="http://discogs.com{discoginfo.uri}">{discoginfo.title}</a><br>
                        <span class="number">Released: {discoginfo.year}</span><br>
                        <span class="">Label: {discoginfo.label}</span>
                        <h3>
                            <span class="label label-default pull-right">{discoginfo.style}</span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    <!-- END discoginfo -->
</div>